import { createHash } from "node:crypto";
import { google } from "googleapis";
import { APP_BUNDLE_ID } from "../config/app-identity.js";

export const GOOGLE_PLAY_REGISTRATION_PRODUCT_ID = "icm_vendor_registration";
const ANDROID_PUBLISHER_SCOPE = "https://www.googleapis.com/auth/androidpublisher";

type ServiceAccountCredentials = {
  client_email?: string;
  private_key?: string;
  project_id?: string;
};

export type VerifiedGooglePlayPurchase = {
  orderId: string | null;
  purchaseTimeMillis: string | null;
  purchaseTokenHash: string;
  purchaseState: number;
};

export type PendingPurchaseResult = {
  isPending: true;
  purchaseTimeMillis: string | null;
};

function loadServiceAccountCredentials(): ServiceAccountCredentials {
  const serializedCredentials = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON;
  if (!serializedCredentials) {
    throw new Error("Google Play purchase verification is not configured.");
  }

  try {
    const credentials = JSON.parse(serializedCredentials) as ServiceAccountCredentials;
    if (!credentials.client_email || !credentials.private_key) {
      throw new Error("missing required service-account fields");
    }
    return credentials;
  } catch (error) {
    throw new Error("Google Play purchase verification credentials are invalid.", { cause: error });
  }
}

function getAndroidPublisherClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: loadServiceAccountCredentials(),
    scopes: [ANDROID_PUBLISHER_SCOPE],
  });

  return google.androidpublisher({ version: "v3", auth });
}

export function hashPurchaseToken(purchaseToken: string): string {
  return createHash("sha256").update(purchaseToken).digest("hex");
}

/**
 * Verifies the one-time vendor-registration entitlement against Google Play.
 * The caller must persist the token hash transactionally to make verification idempotent.
 */
export async function verifyGooglePlayRegistrationPurchase(
  purchaseToken: string,
): Promise<VerifiedGooglePlayPurchase | PendingPurchaseResult> {
  const publisher = getAndroidPublisherClient();
  const response = await publisher.purchases.products.get({
    packageName: APP_BUNDLE_ID,
    productId: GOOGLE_PLAY_REGISTRATION_PRODUCT_ID,
    token: purchaseToken,
  });
  const purchase = response.data;

  // Handle pending purchases (cash payments, etc.)
  if (purchase.purchaseState === 2) {
    return {
      isPending: true,
      purchaseTimeMillis: purchase.purchaseTimeMillis ?? null,
    };
  }

  if (
    purchase.purchaseState !== 0 ||
    (purchase.productId && purchase.productId !== GOOGLE_PLAY_REGISTRATION_PRODUCT_ID) ||
    purchase.consumptionState === 1
  ) {
    throw new Error("Google Play did not confirm an active vendor-registration purchase.");
  }

  // Reject test purchases in production (purchaseType: 0 = test, 1 = promo, null/undefined = production)
  if (purchase.purchaseType === 0) {
    throw new Error("Test purchase not allowed in production.");
  }

  // Acknowledge if not already acknowledged (idempotent - safe to call multiple times)
  if (purchase.acknowledgementState === 0) {
    try {
      await publisher.purchases.products.acknowledge({
        packageName: APP_BUNDLE_ID,
        productId: GOOGLE_PLAY_REGISTRATION_PRODUCT_ID,
        token: purchaseToken,
        requestBody: {},
      });
    } catch (ackError) {
      // Log but don't fail - acknowledgment may have been done by another process
      console.warn("[Billing] Acknowledgment failed (may be idempotent):", ackError);
    }
  }

  return {
    orderId: purchase.orderId ?? null,
    purchaseTimeMillis: purchase.purchaseTimeMillis ?? null,
    purchaseTokenHash: hashPurchaseToken(purchaseToken),
    purchaseState: purchase.purchaseState,
  };
}
