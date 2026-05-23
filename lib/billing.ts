/**
 * Google Play Billing Integration
 * 
 * This module handles the $25 one-time Ice Cream Man vendor registration fee
 * via Google Play Billing. Payment goes directly to the developer's Google Play
 * Developer account.
 * 
 * MONEY FLOW:
 * 1. Driver pays $25 via Google Play Billing
 * 2. Google takes 15% ($3.75) as their platform fee
 * 3. Developer receives $21.25 in their Google Play Developer account
 * 4. Developer cashes out to their bank account via Google Play Console
 * 
 * SETUP REQUIRED (in Google Play Console):
 * 1. Go to Google Play Console → Your App → Monetize → Products → In-app products
 * 2. Create a product with ID: "icm_vendor_registration"
 * 3. Set price: $25.00
 * 4. Set type: "One-time" (non-consumable)
 * 5. Activate the product
 * 
 * CASHING OUT:
 * - Go to Google Play Console → Download reports → Financial
 * - Or set up automatic payouts in Settings → Developer account → Payment settings
 * - Link your bank account for direct deposits (monthly payout cycle)
 */

import { Platform } from 'react-native';

// Product ID - must match what you create in Google Play Console
export const VENDOR_REGISTRATION_PRODUCT_ID = 'icm_vendor_registration';
export const REGISTRATION_PRICE = 25.00;
export const GOOGLE_CUT_PERCENT = 15;
export const DEVELOPER_RECEIVES = REGISTRATION_PRICE * (1 - GOOGLE_CUT_PERCENT / 100);

// Types for billing state
export interface PurchaseResult {
  success: boolean;
  transactionId: string | null;
  purchaseToken: string | null;
  error?: string;
}

export interface BillingState {
  isReady: boolean;
  isPurchasing: boolean;
  isPurchased: boolean;
  error: string | null;
}

/**
 * Initialize Google Play Billing connection.
 * Must be called before any purchase operations.
 * 
 * On web/development, this is a no-op since Google Play Billing
 * only works on actual Android devices with Google Play Services.
 */
export async function initializeBilling(): Promise<boolean> {
  if (Platform.OS === 'web') {
    console.log('[Billing] Web platform - Google Play Billing not available');
    return false;
  }

  try {
    // react-native-iap is only available on native builds
    // It will be added as a dependency during EAS build
    const RNIap = require('react-native-iap');
    const result = await RNIap.initConnection();
    console.log('[Billing] Connection initialized:', result);
    return true;
  } catch (error) {
    console.log('[Billing] IAP not available (expected on web/dev):', (error as any)?.message);
    return false;
  }
}

/**
 * Get the vendor registration product details from Google Play.
 * Returns price, title, description as configured in Play Console.
 */
export async function getRegistrationProduct() {
  if (Platform.OS === 'web') {
    // Return mock product for web/development
    return {
      productId: VENDOR_REGISTRATION_PRODUCT_ID,
      title: 'Ice Cream Man Vendor Registration',
      description: 'One-time registration fee to become an Ice Cream Man vendor. Receive customer requests, track earnings, and save on gas.',
      price: '$25.00',
      localizedPrice: '$25.00',
      currency: 'USD',
    };
  }

  try {
    const RNIap = require('react-native-iap');
    const products = await RNIap.getProducts({
      skus: [VENDOR_REGISTRATION_PRODUCT_ID],
    });
    return products[0] || null;
  } catch (error) {
    console.error('[Billing] Failed to get product:', error);
    return null;
  }
}

/**
 * Purchase the vendor registration.
 * This triggers the Google Play purchase dialog on the user's device.
 * 
 * The $25 payment goes to:
 * - Google (15%): $3.75
 * - Developer (85%): $21.25 → deposited to your Google Play Developer account
 */
export async function purchaseRegistration(): Promise<PurchaseResult> {
  if (Platform.OS === 'web') {
    // Simulate purchase on web for development/testing
    console.log('[Billing] Web platform - simulating purchase');
    return {
      success: true,
      transactionId: `web_sim_${Date.now()}`,
      purchaseToken: `web_token_${Date.now()}`,
    };
  }

  try {
    const RNIap = require('react-native-iap');
    
    // Request purchase - this opens the Google Play purchase dialog
    const purchase = await RNIap.requestPurchase({
      skus: [VENDOR_REGISTRATION_PRODUCT_ID],
      andDangerouslyFinishTransactionAutomaticallyIOS: false,
    });

    if (purchase) {
      // Acknowledge the purchase (required by Google)
      await RNIap.acknowledgePurchaseAndroid({
        token: purchase.purchaseToken,
        developerPayload: '',
      });

      return {
        success: true,
        transactionId: purchase.transactionId || purchase.orderId,
        purchaseToken: purchase.purchaseToken,
      };
    }

    return {
      success: false,
      transactionId: null,
      purchaseToken: null,
      error: 'Purchase was not completed',
    };
  } catch (error: any) {
    // Handle user cancellation gracefully
    if (error.code === 'E_USER_CANCELLED') {
      return {
        success: false,
        transactionId: null,
        purchaseToken: null,
        error: 'Purchase cancelled by user',
      };
    }

    console.error('[Billing] Purchase failed:', error);
    return {
      success: false,
      transactionId: null,
      purchaseToken: null,
      error: error.message || 'Purchase failed',
    };
  }
}

/**
 * Check if the user has already purchased the registration.
 * Used to restore purchases (e.g., after reinstall).
 */
export async function checkExistingPurchase(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false; // Can't check on web
  }

  try {
    const RNIap = require('react-native-iap');
    const purchases = await RNIap.getAvailablePurchases();
    return purchases.some(
      (p: any) => p.productId === VENDOR_REGISTRATION_PRODUCT_ID
    );
  } catch (error) {
    console.error('[Billing] Failed to check purchases:', error);
    return false;
  }
}

/**
 * End the billing connection.
 * Call this when the app is closing or the billing flow is complete.
 */
export async function endBillingConnection(): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    const RNIap = require('react-native-iap');
    await RNIap.endConnection();
  } catch (error) {
    // Ignore cleanup errors
  }
}
