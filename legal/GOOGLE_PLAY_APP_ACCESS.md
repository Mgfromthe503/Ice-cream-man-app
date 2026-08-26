# Google Play Console — App Access Instructions

Use this document to prepare the **App access** response in Google Play Console. It is a release checklist, not a source of credentials. Do not paste passwords, purchase tokens, service-account JSON, or private reviewer details into this file or the public store listing.

## App access status

The released app requires secure sign-in before a customer or vendor can access protected functionality. Select the App access option that indicates restricted functionality and provide the reviewer path below **only after it has been tested in the exact internal-test AAB under review**.

> The previous in-app test-account bypass was intentionally removed. A release must not include a hidden sign-in path, hard-coded reviewer credentials, local payment flags, or a payment bypass.

## Reviewer preparation

Before submitting the release, the release owner must complete the following tasks in the relevant Google Play and identity-provider accounts.

| Task | Required result |
|---|---|
| Secure sign-in | Provision the Google Play reviewer identity in the approved OAuth provider, or supply a time-limited reviewer invitation through the provider's approved process. |
| Vendor billing | Add the reviewer identity to Play Console **License testing** and make `icm_vendor_registration` active for the internal-test track. |
| Backend verification | Configure `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` in the backend secret manager and confirm that a Play test purchase results in a server-verified entitlement. |
| Customer and driver testing | Use separate, authenticated identities where the test requires both roles. Do not elevate a customer by changing a device-only role preference. |

## Reviewer flow

### Customer flow

1. Open the internal-test build and choose **Continue to secure sign-in**.
2. Complete the configured OAuth flow using the reviewer identity supplied through the approved channel.
3. Choose **Customer** after sign-in.
4. Tap the large customer order button. Verify that the **Sweet Safety Reminder** appears before delivery details, then verify that its continuation button is disabled until the parent/guardian acknowledgment is selected.
5. Continue with the acknowledgment, create a request only with test-safe location data, select the intended sharing mode, and confirm the request. Verify that **Street Name Only** is selected by default and the delivery-details safety reminder is visible.
6. Verify the requested permission prompts, location disclosure, parent-aware safety reminder, and cancellation behavior on the test device.

### Vendor flow and one-time product

1. Sign in with the approved vendor reviewer identity and choose **Ice Cream Vendor**.
2. Open vendor registration. The app must show that payment is required until the backend reports a verified entitlement.
3. Complete the one-time `icm_vendor_registration` purchase through Google Play's license-testing flow. The test purchase must not create a real charge.
4. Confirm that the app reports success only after the backend verifies and acknowledges the Google Play purchase.
5. Complete the vendor-profile form, then verify that vendor-only actions are unavailable to a customer identity and available only to a server-side driver profile.

## Information to enter in Play Console

Enter the current secure sign-in and reviewer access process in the Console. Include a support contact capable of provisioning or unblocking the reviewer, but do not enter reusable credentials in a public repository. If the required OAuth reviewer identity, license-test setup, or server verification is unavailable, mark the release as **not ready for review** and resolve it before submission.

## Current release evidence

Attach or retain the following private release evidence for the submitted version code:

| Evidence | Expected result |
|---|---|
| Secure sign-in test | An unauthenticated user is redirected to sign-in; no test-login endpoint is reachable. |
| Customer authorization test | A customer cannot call driver-only queries or mutations. |
| Vendor purchase test | A valid license-test purchase is verified server-side; a fabricated or reused token is rejected. |
| Restore test | A prior purchase is restored only after repeat server verification. |
| Privacy and permission test | The actual runtime permissions and data flows match the current Data safety form and Privacy Policy. |
| Parent-aware safety test | A customer cannot reach delivery details without the explicit acknowledgment; the customer home screen also exposes Safety & Parent Guide and rotating safety tips. |

## Data safety and privacy review

The statements in [Data Safety](DATA_SAFETY.md), [Privacy Policy](PRIVACY_POLICY.md), and [Child Safety and Parent Guidance](CHILD_SAFETY_AND_PARENT_GUIDANCE.md) must be reconciled with the actual SDK and network inventory before release. In particular, review location collection and sharing, any analytics or map provider, purchase history, retention, account deletion, the app's target audience, and the public privacy-policy URL. Do not claim immediate deletion, encrypted transport, parental consent, age verification, or third-party data sharing behavior that has not been validated in the release environment.

## References

[1]: https://support.google.com/googleplay/android-developer/answer/9859455 "Google Play Console Help: App access requirements"
[2]: https://developer.android.com/google/play/billing/test "Android Developers: Test Google Play Billing"
