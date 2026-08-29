/**
 * @deprecated This module is DEPRECATED and not used by the current billing flow.
 *
 * The actual Google Play Billing flow uses:
 * - lib/billing.ts (client-side)
 * - server/google-play.ts (server-side verification with Play Developer API)
 * - server/routers-payment.ts (tRPC endpoints)
 * - server/db.ts (vendorEntitlements table)
 *
 * This file implemented a Stripe-like payment flow that was replaced by
 * native Google Play Billing (expo-iap). Kept for reference only.
 *
 * DO NOT USE IN PRODUCTION CODE.
 */
export const paymentConfig = {
  vendorRegistrationFee: 25.0,
  developerWalletEmail: "mindy.gaines1@gmail.com",
  platformCommissionRate: 0.15,
} as const;

export async function processVendorRegistration(): Promise<{ success: false; error: string }> {
  return { success: false, error: "Deprecated: Use Google Play Billing flow via lib/billing.ts" };
}

export async function processDailySalesCommission(): Promise<{ success: false; error: string }> {
  return { success: false, error: "Deprecated: Use Google Play Billing flow" };
}

export async function getDeveloperEarnings(): Promise<number> {
  return 0;
}

export async function getVendorRegistrationRevenue(): Promise<number> {
  return 0;
}