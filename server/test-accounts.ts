/**
 * Google Play Store Reviewer Test Accounts
 * 
 * These hardcoded accounts allow the Google Play review team to test
 * both Customer and Driver flows without needing OAuth, email verification,
 * or payment processing.
 * 
 * CREDENTIALS:
 * - Customer: Icecream@customertest.com / GoogleTest2026!
 * - Driver:   Icecream@driverlogintest.com / GoogleTest2026!
 * 
 * The driver account is pre-seeded as Paid, Active, and Approved,
 * bypassing the $25 registration fee entirely.
 */

export interface TestAccount {
  email: string;
  password: string;
  role: 'customer' | 'driver';
  displayName: string;
  openId: string;
  // Driver-specific pre-seeded state
  driverProfile?: {
    fullName: string;
    truckName: string;
    truckNumber: string;
    areaCode: string;
    isPaid: boolean;
    isRegistered: boolean;
    isApproved: boolean;
    isActive: boolean;
  };
}

export const TEST_ACCOUNTS: TestAccount[] = [
  {
    email: 'Icecream@customertest.com',
    password: 'GoogleTest2026!',
    role: 'customer',
    displayName: 'Test Customer',
    openId: 'google_play_reviewer_customer_001',
  },
  {
    email: 'Icecream@driverlogintest.com',
    password: 'GoogleTest2026!',
    role: 'driver',
    displayName: 'Test Driver',
    openId: 'google_play_reviewer_driver_001',
    driverProfile: {
      fullName: 'Test Driver (Google Reviewer)',
      truckName: 'Review Truck',
      truckNumber: 'ICM-9999',
      areaCode: '97005',
      isPaid: true,
      isRegistered: true,
      isApproved: true,
      isActive: true,
    },
  },
];

/**
 * Check if an email matches a test account.
 * Case-insensitive comparison.
 */
export function findTestAccount(email: string): TestAccount | undefined {
  return TEST_ACCOUNTS.find(
    (acc) => acc.email.toLowerCase() === email.toLowerCase()
  );
}

/**
 * Validate test account credentials.
 * Returns the account if email + password match, undefined otherwise.
 */
export function validateTestCredentials(
  email: string,
  password: string
): TestAccount | undefined {
  const account = findTestAccount(email);
  if (!account) return undefined;
  if (account.password !== password) return undefined;
  return account;
}

/**
 * Check if an email belongs to a test account (for bypass logic).
 */
export function isTestAccountEmail(email: string): boolean {
  return TEST_ACCOUNTS.some(
    (acc) => acc.email.toLowerCase() === email.toLowerCase()
  );
}
