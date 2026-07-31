/**
 * Google Play Billing Integration (expo-iap v5.0.0 + Billing Library 7.0.0)
 * 
 * This module handles the $25 one-time Ice Cream Man vendor registration fee
 * via Google Play Billing. Payment goes directly to the developer's Google Play
 * Developer account.
 */

import { Platform } from 'react-native';
import { validatePurchaseToken, createSecureReceipt, isRateLimited, generateTransactionFingerprint } from './security';

export const VENDOR_REGISTRATION_PRODUCT_ID = 'icm_vendor_registration';
export const REGISTRATION_PRICE = 25.00;
export const GOOGLE_CUT_PERCENT = 15;
export const DEVELOPER_RECEIVES = REGISTRATION_PRICE * (1 - GOOGLE_CUT_PERCENT / 100);

export interface PurchaseResult {
  success: boolean;
  transactionId: string | null;
  purchaseToken: string | null;
  error?: string;
}

/**
 * Initialize Google Play Billing connection.
 */
export async function initializeBilling(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  try {
    const ExpoIap = require('expo-iap');
    await ExpoIap.initConnection();
    return true;
  } catch (error) {
    console.error('[Billing] Connection failed:', error);
    return false;
  }
}

/**
 * Get the vendor registration product details.
 */
export async function getRegistrationProduct() {
  if (Platform.OS === 'web') {
    return {
      productId: VENDOR_REGISTRATION_PRODUCT_ID,
      title: 'Ice Cream Man Vendor Registration',
      description: 'One-time registration fee to become an Ice Cream Man vendor.',
      price: '$25.00',
      localizedPrice: '$25.00',
      currency: 'USD',
    };
  }

  try {
    const ExpoIap = require('expo-iap');
    const products = await ExpoIap.getProducts({
      skus: [VENDOR_REGISTRATION_PRODUCT_ID]
    });
    return products?.[0] || null;
  } catch (error) {
    console.error('[Billing] Failed to get product:', error);
    return null;
  }
}

/**
 * Purchase the vendor registration using expo-iap v5.0.0 API.
 */
export async function purchaseRegistration(): Promise<PurchaseResult> {
  if (isRateLimited('purchase_registration', 3, 60000)) {
    return { success: false, transactionId: null, purchaseToken: null, error: 'Too many attempts.' };
  }

  if (Platform.OS === 'web') {
    const simId = `web_${Date.now()}`;
    const simToken = `token_${Date.now()}`;
    await createSecureReceipt(simId, VENDOR_REGISTRATION_PRODUCT_ID, simToken);
    return { success: true, transactionId: simId, purchaseToken: simToken };
  }

  try {
    const ExpoIap = require('expo-iap');
    const obfuscatedAccountId = generateTransactionFingerprint();
    
    // expo-iap v5.0.0 request shape (Google Play Billing Library 7.0.0 compatible)
    const purchase = await ExpoIap.requestPurchase({
      request: {
        sku: VENDOR_REGISTRATION_PRODUCT_ID,
        obfuscatedAccountId,
        obfuscatedProfileId: 'vendor-registration',
      },
    });

    if (purchase) {
      if (!validatePurchaseToken(purchase.purchaseToken)) {
        return { success: false, transactionId: null, purchaseToken: null, error: 'Invalid token.' };
      }

      // Acknowledge the purchase
      await ExpoIap.finishTransaction({
        purchase,
        isConsumable: false,
      });

      const transactionId = purchase.transactionId || purchase.orderId;
      await createSecureReceipt(transactionId, VENDOR_REGISTRATION_PRODUCT_ID, purchase.purchaseToken);

      return { success: true, transactionId, purchaseToken: purchase.purchaseToken };
    }

    return { success: false, transactionId: null, purchaseToken: null, error: 'Purchase not completed' };
  } catch (error: any) {
    if (error.code === 'E_USER_CANCELLED') {
      return { success: false, transactionId: null, purchaseToken: null, error: 'Cancelled' };
    }
    return { success: false, transactionId: null, purchaseToken: null, error: error.message };
  }
}

/**
 * Check if the user has already purchased.
 */
export async function checkExistingPurchase(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  try {
    const ExpoIap = require('expo-iap');
    const purchases = await ExpoIap.getAvailablePurchases();
    return purchases.some((p: any) => p.productId === VENDOR_REGISTRATION_PRODUCT_ID);
  } catch (error) {
    return false;
  }
}

/**
 * End the billing connection.
 */
export async function endBillingConnection(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    const ExpoIap = require('expo-iap');
    await ExpoIap.endConnection();
  } catch (error) {}
}
