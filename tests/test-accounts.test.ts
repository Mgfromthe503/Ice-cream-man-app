import { describe, it, expect } from 'vitest';
import { validateTestCredentials, findTestAccount, isTestAccountEmail, TEST_ACCOUNTS } from '../server/test-accounts';

describe('Test Accounts Module', () => {
  describe('TEST_ACCOUNTS configuration', () => {
    it('should have exactly 2 test accounts', () => {
      expect(TEST_ACCOUNTS).toHaveLength(2);
    });

    it('should have a customer test account', () => {
      const customer = TEST_ACCOUNTS.find(a => a.role === 'customer');
      expect(customer).toBeDefined();
      expect(customer!.email).toBe('Icecream@customertest.com');
      expect(customer!.password).toBe('GoogleTest2026!');
      expect(customer!.displayName).toBe('Test Customer');
    });

    it('should have a driver test account', () => {
      const driver = TEST_ACCOUNTS.find(a => a.role === 'driver');
      expect(driver).toBeDefined();
      expect(driver!.email).toBe('Icecream@driverlogintest.com');
      expect(driver!.password).toBe('GoogleTest2026!');
      expect(driver!.displayName).toBe('Test Driver');
    });

    it('driver account should have pre-seeded profile with paid/active/approved status', () => {
      const driver = TEST_ACCOUNTS.find(a => a.role === 'driver');
      expect(driver!.driverProfile).toBeDefined();
      expect(driver!.driverProfile!.isPaid).toBe(true);
      expect(driver!.driverProfile!.isActive).toBe(true);
      expect(driver!.driverProfile!.isApproved).toBe(true);
      expect(driver!.driverProfile!.isRegistered).toBe(true);
      expect(driver!.driverProfile!.truckNumber).toBe('ICM-9999');
      expect(driver!.driverProfile!.areaCode).toBe('97005');
    });
  });

  describe('findTestAccount', () => {
    it('should find customer account by email (case insensitive)', () => {
      const account = findTestAccount('icecream@customertest.com');
      expect(account).toBeDefined();
      expect(account!.role).toBe('customer');
    });

    it('should find driver account by email (case insensitive)', () => {
      const account = findTestAccount('ICECREAM@DRIVERLOGINTEST.COM');
      expect(account).toBeDefined();
      expect(account!.role).toBe('driver');
    });

    it('should return undefined for unknown email', () => {
      const account = findTestAccount('unknown@test.com');
      expect(account).toBeUndefined();
    });
  });

  describe('validateTestCredentials', () => {
    it('should validate correct customer credentials', () => {
      const account = validateTestCredentials('Icecream@customertest.com', 'GoogleTest2026!');
      expect(account).toBeDefined();
      expect(account!.role).toBe('customer');
    });

    it('should validate correct driver credentials', () => {
      const account = validateTestCredentials('Icecream@driverlogintest.com', 'GoogleTest2026!');
      expect(account).toBeDefined();
      expect(account!.role).toBe('driver');
    });

    it('should reject wrong password', () => {
      const account = validateTestCredentials('Icecream@customertest.com', 'WrongPassword!');
      expect(account).toBeUndefined();
    });

    it('should reject unknown email', () => {
      const account = validateTestCredentials('hacker@evil.com', 'GoogleTest2026!');
      expect(account).toBeUndefined();
    });

    it('should be case insensitive for email but case sensitive for password', () => {
      const valid = validateTestCredentials('icecream@CUSTOMERTEST.COM', 'GoogleTest2026!');
      expect(valid).toBeDefined();

      const invalid = validateTestCredentials('Icecream@customertest.com', 'googletest2026!');
      expect(invalid).toBeUndefined();
    });
  });

  describe('isTestAccountEmail', () => {
    it('should return true for customer test email', () => {
      expect(isTestAccountEmail('Icecream@customertest.com')).toBe(true);
    });

    it('should return true for driver test email', () => {
      expect(isTestAccountEmail('Icecream@driverlogintest.com')).toBe(true);
    });

    it('should return false for non-test email', () => {
      expect(isTestAccountEmail('regular@user.com')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(isTestAccountEmail('ICECREAM@CUSTOMERTEST.COM')).toBe(true);
    });
  });
});
