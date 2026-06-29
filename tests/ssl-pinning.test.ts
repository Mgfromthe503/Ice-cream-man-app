import { describe, it, expect, vi } from 'vitest';
import {
  validateCertificatePin,
  verifyCertificateTransparency,
  generateAndroidNetworkSecurityConfig,
  generateIOSATSConfig,
  getPinningStatus,
  PINNED_CERTIFICATES,
} from '../lib/ssl-pinning';

// Mock React Native Platform
vi.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

describe('SSL Certificate Pinning', () => {
  describe('PINNED_CERTIFICATES configuration', () => {
    it('should have at least one pinned domain', () => {
      expect(Object.keys(PINNED_CERTIFICATES).length).toBeGreaterThanOrEqual(1);
    });

    it('should have at least 2 pins per domain (primary + backup)', () => {
      for (const [domain, config] of Object.entries(PINNED_CERTIFICATES)) {
        expect(config.pins.length).toBeGreaterThanOrEqual(2);
      }
    });

    it('should include the production domain', () => {
      expect(PINNED_CERTIFICATES['icecreamapp-q7oiswec.manus.space']).toBeDefined();
    });

    it('should have includeSubdomains set', () => {
      const config = PINNED_CERTIFICATES['icecreamapp-q7oiswec.manus.space'];
      expect(config.includeSubdomains).toBe(true);
    });

    it('should have a reasonable maxAge (at least 1 day)', () => {
      const config = PINNED_CERTIFICATES['icecreamapp-q7oiswec.manus.space'];
      expect(config.maxAge).toBeGreaterThanOrEqual(86400);
    });
  });

  describe('validateCertificatePin', () => {
    it('should return valid=true for matching pin', () => {
      const config = PINNED_CERTIFICATES['icecreamapp-q7oiswec.manus.space'];
      const result = validateCertificatePin(
        'icecreamapp-q7oiswec.manus.space',
        config.pins[2] // Let's Encrypt pin
      );
      expect(result.valid).toBe(true);
      expect(result.matchedPin).toBe(config.pins[2]);
      expect(result.error).toBeNull();
    });

    it('should return valid=false for non-matching pin', () => {
      const result = validateCertificatePin(
        'icecreamapp-q7oiswec.manus.space',
        'INVALID_HASH_THAT_DOES_NOT_MATCH_ANY_PIN'
      );
      expect(result.valid).toBe(false);
      expect(result.matchedPin).toBeNull();
      expect(result.error).toContain('pin mismatch');
    });

    it('should return valid=true for unknown domains (not pinned)', () => {
      const result = validateCertificatePin(
        'unknown-domain.com',
        'any_hash_value'
      );
      expect(result.valid).toBe(true);
      expect(result.matchedPin).toBeNull();
    });

    it('should include timestamp in result', () => {
      const before = Date.now();
      const result = validateCertificatePin('unknown.com', 'hash');
      expect(result.timestamp).toBeGreaterThanOrEqual(before);
      expect(result.timestamp).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('verifyCertificateTransparency', () => {
    it('should return true for valid SCT timestamp', () => {
      const validTimestamp = Date.now() - 86400000; // 1 day ago
      expect(verifyCertificateTransparency('test.com', validTimestamp)).toBe(true);
    });

    it('should return false for future SCT timestamp (forgery)', () => {
      const futureTimestamp = Date.now() + 172800000; // 2 days in future
      expect(verifyCertificateTransparency('test.com', futureTimestamp)).toBe(false);
    });

    it('should return true for null SCT (graceful fallback)', () => {
      expect(verifyCertificateTransparency('test.com', null)).toBe(true);
    });

    it('should return true for old but valid SCT', () => {
      const oldTimestamp = Date.now() - (200 * 24 * 60 * 60 * 1000); // 200 days ago
      expect(verifyCertificateTransparency('test.com', oldTimestamp)).toBe(true);
    });
  });

  describe('generateAndroidNetworkSecurityConfig', () => {
    it('should generate valid XML', () => {
      const xml = generateAndroidNetworkSecurityConfig();
      expect(xml).toContain('<?xml version="1.0"');
      expect(xml).toContain('<network-security-config>');
      expect(xml).toContain('</network-security-config>');
    });

    it('should include cleartext traffic disabled', () => {
      const xml = generateAndroidNetworkSecurityConfig();
      expect(xml).toContain('cleartextTrafficPermitted="false"');
    });

    it('should include pinned domains', () => {
      const xml = generateAndroidNetworkSecurityConfig();
      expect(xml).toContain('icecreamapp-q7oiswec.manus.space');
    });

    it('should include pin-set with SHA-256 digest', () => {
      const xml = generateAndroidNetworkSecurityConfig();
      expect(xml).toContain('digest="SHA-256"');
    });

    it('should include debug overrides for development', () => {
      const xml = generateAndroidNetworkSecurityConfig();
      expect(xml).toContain('<debug-overrides>');
    });
  });

  describe('generateIOSATSConfig', () => {
    it('should disable arbitrary loads', () => {
      const config = generateIOSATSConfig();
      expect(config.NSAppTransportSecurity.NSAllowsArbitraryLoads).toBe(false);
    });

    it('should allow localhost for development', () => {
      const config = generateIOSATSConfig();
      expect(config.NSAppTransportSecurity.NSExceptionDomains.localhost).toBeDefined();
      expect(
        config.NSAppTransportSecurity.NSExceptionDomains.localhost.NSExceptionAllowsInsecureHTTPLoads
      ).toBe(true);
    });
  });

  describe('getPinningStatus', () => {
    it('should return platform info', () => {
      const status = getPinningStatus();
      expect(status.platform).toBe('ios');
    });

    it('should list pinned domains', () => {
      const status = getPinningStatus();
      expect(status.domains).toContain('icecreamapp-q7oiswec.manus.space');
    });

    it('should count total pins', () => {
      const status = getPinningStatus();
      expect(status.pinCount).toBeGreaterThanOrEqual(2);
    });
  });
});
