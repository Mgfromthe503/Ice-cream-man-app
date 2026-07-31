/**
 * Google Play Billing Integration (Updated for react-native-iap v12.x)
 * 
 * This module handles the $25 one-time Ice Cream Man vendor registration fee
 * via Google Play Billing. Payment goes directly to the developer's Google Play
 * Developer account.
 */

import { Platform } from 'react-native';
import { validatePurchaseToken, createSecureReceipt, isRateLimited, generateTransactionFingerprint } from './security';

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

/**
 * Initialize Google Play Billing connection.
 */
export async function initializeBilling(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  try {
    const RNIap = require('react-native-iap');
    await RNIap.initConnection();
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
    const RNIap = require('react-native-iap');
    const products = await RNIap.getProducts({
      skus: [VENDOR_REGISTRATION_PRODUCT_ID]
    });
    return products?.[0] || null;
  } catch (error) {
    console.error('[Billing] Failed to get product:', error);
    return null;
  }
}

/**
 * Purchase the vendor registration.
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
    const RNIap = require('react-native-iap');
    const obfuscatedAccountId = generateTransactionFingerprint();
    
    // v12.x request shape
    const purchase = await RNIap.requestPurchase({
      skus: [VENDOR_REGISTRATION_PRODUCT_ID],
      obfuscatedAccountIdAndroid: obfuscatedAccountId,
      obfuscatedProfileIdAndroid: 'vendor-registration',
      andDangerouslyFinishTransactionAutomaticallyIOS: false,
    });

    if (purchase) {
      if (!validatePurchaseToken(purchase.purchaseToken)) {
        return { success: false, transactionId: null, purchaseToken: null, error: 'Invalid token.' };
      }

      // Acknowledge the purchase
      await RNIap.finishTransaction({
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
    const RNIap = require('react-native-iap');
    const purchases = await RNIap.getAvailablePurchases();
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
    const RNIap = require('react-native-iap');
    await RNIap.endConnection();
  } catch (error) {}
}
