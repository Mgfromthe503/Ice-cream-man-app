import { Platform } from "react-native";
import { isRateLimited, validatePurchaseToken } from "./security";

export const VENDOR_REGISTRATION_PRODUCT_ID = "icm_vendor_registration";
export const REGISTRATION_PRICE = 25;

export interface PurchaseResult {
  success: boolean;
  transactionId: string | null;
  purchaseToken: string | null;
  error?: string;
  errorCode?: string;
}

/**
 * Maps Google Play Billing error codes to user-friendly messages.
 * See: https://developer.android.com/google/play/billing/rtdn-reference
 */
function mapBillingError(code: string): { message: string; retryable: boolean } {
  switch (code) {
    case "E_USER_CANCELLED":
      return { message: "Cancelled", retryable: false };
    case "E_ITEM_UNAVAILABLE":
      return { message: "This product is not available for purchase.", retryable: false };
    case "E_DEVELOPER_ERROR":
      return { message: "Billing configuration error. Please contact support.", retryable: false };
    case "E_ERROR":
      return { message: "An error occurred. Please try again.", retryable: true };
    case "E_ITEM_ALREADY_OWNED":
      return { message: "You already own this item. Restoring purchase...", retryable: false };
    case "E_ITEM_NOT_OWNED":
      return { message: "Item not owned.", retryable: false };
    case "E_SERVICE_UNAVAILABLE":
      return { message: "Google Play service is unavailable. Please try again later.", retryable: true };
    case "E_SERVICE_DISCONNECTED":
      return { message: "Billing service disconnected. Reconnecting...", retryable: true };
    case "E_BILLING_UNAVAILABLE":
      return { message: "Billing is not available on this device.", retryable: false };
    case "E_FEATURE_NOT_SUPPORTED":
      return { message: "This feature is not supported.", retryable: false };
    case "E_INAPP_NOT_INITIALIZED":
      return { message: "Billing not initialized. Please restart the app.", retryable: true };
    default:
      return { message: "An unexpected error occurred.", retryable: true };
  }
}

/** Native Google Play Billing connection. Vendor registration is unavailable on web. */
export async function initializeBilling(): Promise<boolean> {
  if (Platform.OS === "web") return false;

  try {
    const ExpoIap = require("expo-iap");
    await ExpoIap.initConnection();
    return true;
  } catch (error) {
    console.error("[Billing] Connection failed", error);
    return false;
  }
}

export async function getRegistrationProduct() {
  if (Platform.OS === "web") return null;

  try {
    const ExpoIap = require("expo-iap");
    const products = await ExpoIap.getProducts({ skus: [VENDOR_REGISTRATION_PRODUCT_ID] });
    return products?.[0] ?? null;
  } catch (error) {
    console.error("[Billing] Failed to load the registration product", error);
    return null;
  }
}

/**
 * Starts Google Play Billing and returns the opaque purchase token. The caller
 * must send it to the backend and wait for server verification before granting
 * registration access or persisting any entitlement state.
 */
export async function purchaseRegistration(): Promise<PurchaseResult> {
  if (Platform.OS === "web") {
    return {
      success: false,
      transactionId: null,
      purchaseToken: null,
      error: "Vendor registration is only available in the Android app.",
      errorCode: "WEB_UNSUPPORTED",
    };
  }
  if (isRateLimited("purchase_registration", 3, 60_000)) {
    return { success: false, transactionId: null, purchaseToken: null, error: "Too many attempts.", errorCode: "RATE_LIMITED" };
  }

  try {
    const ExpoIap = require("expo-iap");
    const purchase = await ExpoIap.requestPurchase({
      request: { sku: VENDOR_REGISTRATION_PRODUCT_ID },
    });
    const purchaseToken = typeof purchase?.purchaseToken === "string" ? purchase.purchaseToken : null;
    if (!purchase || !purchaseToken) {
      return { success: false, transactionId: null, purchaseToken: null, error: "Purchase was not completed.", errorCode: "INCOMPLETE" };
    }

    // Validate token format client-side before sending to server
    if (!validatePurchaseToken(purchaseToken)) {
      console.error("[Billing] Invalid purchase token format received");
      return { success: false, transactionId: null, purchaseToken: null, error: "Invalid purchase data received.", errorCode: "INVALID_TOKEN" };
    }

    return {
      success: true,
      transactionId: purchase.transactionId ?? purchase.orderId ?? null,
      purchaseToken,
    };
  } catch (error: unknown) {
    const code = typeof error === "object" && error !== null && "code" in error ? (error as { code?: string }).code : undefined;
    const { message, retryable } = code ? mapBillingError(code) : { message: error instanceof Error ? error.message : "The purchase could not be started.", retryable: true };
    return {
      success: false,
      transactionId: null,
      purchaseToken: null,
      error: message,
      errorCode: code ?? "UNKNOWN",
    };
  }
}

/** Return a restorable Play purchase token; server verification is still required. */
export async function getExistingRegistrationPurchase(): Promise<PurchaseResult> {
  if (Platform.OS === "web") {
    return { success: false, transactionId: null, purchaseToken: null, error: "Not available on web.", errorCode: "WEB_UNSUPPORTED" };
  }

  try {
    const ExpoIap = require("expo-iap");
    const purchases = await ExpoIap.getAvailablePurchases();
    const purchase = purchases.find((item: { productId?: string }) => item.productId === VENDOR_REGISTRATION_PRODUCT_ID);
    const purchaseToken = typeof purchase?.purchaseToken === "string" ? purchase.purchaseToken : null;

    if (!purchaseToken) {
      return { success: false, transactionId: null, purchaseToken: null, error: "No prior purchase was found.", errorCode: "NOT_FOUND" };
    }

    // Validate token format client-side before sending to server
    if (!validatePurchaseToken(purchaseToken)) {
      console.error("[Billing] Invalid purchase token format on restore");
      return { success: false, transactionId: null, purchaseToken: null, error: "Invalid purchase data.", errorCode: "INVALID_TOKEN" };
    }

    return {
      success: true,
      transactionId: purchase.transactionId ?? purchase.orderId ?? null,
      purchaseToken,
    };
  } catch (error) {
    console.error("[Billing] Failed to restore a purchase", error);
    return { success: false, transactionId: null, purchaseToken: null, error: "Unable to restore the purchase.", errorCode: "RESTORE_FAILED" };
  }
}

export async function finishVerifiedRegistrationPurchase(purchaseToken: string): Promise<void> {
  if (Platform.OS === "web") return;

  try {
    const ExpoIap = require("expo-iap");
    await ExpoIap.finishTransaction({
      purchase: { productId: VENDOR_REGISTRATION_PRODUCT_ID, purchaseToken },
      isConsumable: false,
    });
  } catch (error) {
    // The backend acknowledgement is authoritative. Client finalization can be retried during restore.
    console.warn("[Billing] Client transaction finalization will be retried", error);
  }
}

export async function endBillingConnection(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    const ExpoIap = require("expo-iap");
    await ExpoIap.endConnection();
  } catch (error) {
    console.warn("[Billing] Failed to close the billing connection", error);
  }
}
