# The Ice Cream Man — Google Play Compliance

> **Canonical, consolidated reference for submitting and resubmitting The Ice Cream Man to Google Play.**
> This document merges the Privacy Policy, Data Safety form, store listing rules, app-access guidance, and rejection responses into one source of truth. The original references remain authoritative and are linked where relevant.

---

## A. App Identity & Account

| Field | Value |
|-------|-------|
| **Package name (applicationId)** | `com.icecreamman.app` |
| **App name (Play listing)** | The Ice Cream Man |
| **Short description** | Summon an ice cream truck to your neighborhood with one tap! Drivers earn more. |
| **Category** | Food & Drink |
| **Content rating** | Everyone |
| **Developer** | Mindy Gaines |
| **Location** | Beaverton, Oregon, United States |
| **Support / Contact email** | **mindy.gaines1@gmail.com** (this is the ONLY support email used in any public, legal, or Play Console material — never use support@theicecreamman.app) |
| **Privacy Policy URL** | `https://mgfromthe503.github.io/Ice-cream-man-app/privacy.html` |
| **Version (current)** | 1.0.22 (versionCode 10057) |
| **Account type note** | Submitted on an individual developer account. The **only** org-account triggers under the Play Console Requirements policy are financial services, health apps, `VpnService` apps, and government apps. This app is **none** of these. The rejection was driven by the store listing and the Play Console financial-features declaration reading as a financial/gig service. Fix every declaration per [`PLAY_CONSOLE_CONTENT_DECLARATIONS.md`](PLAY_CONSOLE_CONTENT_DECLARATIONS.md) (set **Financial features = none**, Category = Food & Drink), then resubmit with a fresh build. |

> **Email rule:** The support/contact email in **all** legal documents and Play Console entries must be `mindy.gaines1@gmail.com`. Do **not** use `support@theicecreamman.app` anywhere.

---

## B. Privacy Policy

The canonical Privacy Policy lives in [`PRIVACY_POLICY.md`](PRIVACY_POLICY.md) and is hosted publicly at `https://mgfromthe503.github.io/Ice-cream-man-app/privacy.html`. The following is the reconciled, cleaned summary used for Play compliance.

**Effective Date:** June 29, 2026 · **Last Updated:** August 26, 2026

### B.1 Two user roles
The app serves two roles within one application:

| Role | Description | Key data interaction |
|------|-------------|----------------------|
| **Customer** | Requests ice cream delivery to their location | Shares location (at their chosen precision) with the assigned Driver |
| **Driver/Vendor** | Receives and fulfills customer delivery requests | Shares real-time GPS location for proximity verification and navigation |

### B.2 Information we collect
- **Customer location — explicit choice.** Before each order the customer chooses one of three sharing modes: **Exact Address** (full street address via reverse geocoding), **Street Name Only** (no house number), or **Custom Meetup Point** (free-text landmark, no coordinates). Customers may also provide optional delivery instructions visible only to the assigned Driver during the active delivery.
- **Driver location — proximity.** Driver GPS is used to receive requests in their coverage area, run the 1000-foot proximity verification needed to complete a delivery, and provide real-time ETA to customers.
- **Temporary caching & immediate destruction.** Customer location data is cached locally on the Driver's device (via AsyncStorage) **only for the duration of active navigation**. The moment a delivery is marked complete (or cancelled), **all customer location data is automatically and permanently destroyed** — this includes the delivery address, coordinates, delivery instruction text, and meetup point descriptions. No customer location history is retained on any device or server after a delivery completes.
- **Payments.** Google Play Billing exclusively, for the one-time $25 Driver registration fee. The app does not collect or store card numbers or financial credentials. Only the transaction ID and a purchase verification token (encrypted in device Keychain/Keystore) are retained.
- **Account information.** Name, email address (OAuth authentication), area/zip code (Drivers), and truck registration info (Drivers).
- **Device information.** Device platform, app state (foreground/background), and push-notification token.

### B.3 How we use and retain data
- Customer GPS coordinates and delivery instructions: **deleted immediately on delivery completion**.
- Customer share-mode choice: session-only.
- Driver GPS coordinates: session-only (used for the 1000-foot proximity check).
- Driver area/zip code: stored locally until changed.
- Registration payment token: encrypted in device Keychain/Keystore.
- Account information: retained until account deletion.

### B.4 Sharing and disclosure
The app does **not** sell, rent, or share personal data for advertising, analytics, or marketing.

- **Between users (active delivery only):** Driver receives the customer's location (per chosen mode) plus delivery instructions; the customer receives the Driver's first name and real-time ETA. Destroyed on completion.
- **Service providers (only two):**
  - **Google Play Billing** — transaction metadata only (no card details) for the registration fee.
  - **OpenStreetMap Nominatim** — GPS coordinates only (no user identity) for reverse geocoding.
- **Legal requirements.** Disclosure when required by law or a valid public-authority request.

### B.5 Location use (foreground only)
**The current Android release requests foreground location only. It does not request the Android background-location permission and does not run a location foreground service.** Location updates run only while the app is active. **The developer must update this policy, the Data Safety form, and the Play Console declarations before enabling background location or a location foreground service in a future release.**

### B.6 Children, parents, and guardians
General-audience Food & Drink dispatch app. It is not designed for a child to independently arrange a real-world delivery or share location. Before any customer request advances to delivery details, the app shows a plain-language safety reminder and requires an acknowledgment that a parent or guardian knows about the request — a practical safety measure, not age verification or verifiable parental consent. A parent/guardian who believes a child has provided personal information without permission may contact `mindy.gaines1@gmail.com` to request deletion.

### B.7 Vendor screening disclosure
The app does **not** perform background, criminal-history, or driving-record checks on vendors. Vendor registration requires only payment of the registration fee and completion of the registration form.

### B.8 Account deletion (in-app + API)
Users can delete their account and all associated data **in-app** from the profile screen (under Settings). The app calls the backend endpoint `POST /api/auth/delete-account`, which performs server-side data deletion. After deletion the user is returned to the role-selection screen. Users may also request deletion by emailing `mindy.gaines1@gmail.com`. The same deletion capacity is exposed to both the Customer and Driver profiles.

### B.9 Rights & jurisdictions
- **Your rights:** access, correction, deletion (in-app or via email `mindy.gaines1@gmail.com`), location control, and data portability.
- **CCPA (California):** right to know what is collected, whether it is sold/disclosed, opt-out of sale, and non-discrimination. **The app does not sell personal information.**
- **Changes:** posted within the App with an updated "Last Updated" date.

### B.10 Contact
Email `mindy.gaines1@gmail.com` (Mindy Gaines, Beaverton, Oregon, USA).

---

## C. Google Play Data Safety Form

Ground truth for the Data Safety responses in Play Console. The full form source lives in [`DATA_SAFETY.md`](DATA_SAFETY.md).

### C.1 Overview
| Question | Answer |
|----------|--------|
| Does your app collect or share any of the required user data types? | Yes |
| Is all user data collected by the app encrypted in transit? | Yes |
| Do you provide a way for users to request deletion of their data? | Yes (in-app + public web request page) |

### C.2 Data types collected (truthful set)
| Data Type | Collected | Shared | Purpose | Optional |
|-----------|-----------|--------|---------|----------|
| Approximate location | Yes | No | App functionality | No |
| Precise location | Yes | Yes (with other users) | App functionality | No |
| Name | Yes | Yes (with other users) | App functionality | No |
| Email address | Yes | No | Account management | No |
| Phone number | **No** | No | N/A | N/A |
| Purchase history | Yes | No | App functionality | No |
| App interactions | Yes | No | App functionality | No |
| Other user-generated content | Yes | No | App functionality | Yes |
| Device or other IDs | Yes | No | App functionality (push notifications) | No |

> **Truthfulness rules for the form:**
> - **NO phone number** is collected — leave the Phone number field as "No".
> - **NO analytics.** "App interactions" is collected for app functionality, not analytics.
> - **NO Google Analytics, NO Google Maps SDK, NO AdMob, NO advertising SDK.** Do not declare any of these in the form.

### C.3 Data shared with third parties (only these two)
| Third Party | Data Shared | Purpose |
|-------------|-------------|---------|
| **Google Play Billing** | Purchase transaction metadata (no card details) | Vendor registration fee processing |
| **OpenStreetMap Nominatim** | GPS coordinates (no user identity) | Reverse geocoding |

Tapping "Navigate" in the driver flow opens the user's own external maps application; the app does not send location data to a third-party map SDK for analytics or tracking.

### C.4 Handling and security practices
- Data encrypted in transit (HTTPS/TLS) — **yes** · at rest — **yes**.
- Users can request data deletion — **yes** (in-app Delete Account + public request page at `https://mgfromthe503.github.io/Ice-cream-man-app/account-deletion.html`).
- HTTPS, authentication required, regular security updates, access controls, data minimization — all **yes**.
- Compliant with children's privacy laws — **yes** (general-audience app; see §B.6).

### C.5 Data deletion declaration
Deletion is available **in-app** (both Customer and Driver profiles) via `POST /api/auth/delete-account`, and through the public request page at `https://mgfromthe503.github.io/Ice-cream-man-app/account-deletion.html`, which provides a deletion-request email action. This satisfies the documented in-app and external request paths.

---

## D. Google Play Listing Rules & Store Listing Details

Sources: [`GOOGLE_PLAY_LISTING.md`](GOOGLE_PLAY_LISTING.md), [`GOOGLE_PLAY_APP_ACCESS.md`](GOOGLE_PLAY_APP_ACCESS.md), [`docs/rejection-response.md`](../docs/rejection-response.md), and the rejection-fixes checkpoint.

### D.1 No test-login / no hard-coded reviewer credentials
> **The previous in-app test-account bypass was intentionally REMOVED. Do NOT add it back.**
- A release must **not** include a hidden sign-in path, hard-coded reviewer credentials, local payment flags, or a payment bypass.
- App access must be declared as **restricted functionality**, with the reviewer path provided only after it has been tested in the exact internal-test AAB under review.
- The reviewer identity is provisioned through the approved OAuth provider (or a time-limited reviewer invitation), not hard-coded.

### D.2 Category & content rating
- **Category:** **Food & Drink** (do not use Business or Finance).
- **Content rating:** **Everyone**.
- **Org-account root cause (confirmed):** Google Play only forces an **organization account** for financial products/services, health apps, `VpnService` apps, and government apps. This app is none of these — it is a Food & Drink ice cream-truck dispatch app whose only payment is a one-time Google Play Billing registration/access purchase (not a financial service). The rejection was triggered by the store listing and the Play Console **Financial features** declaration reading as a financial/gig-economy service. **Fix:** set the Play Console **Financial features** declaration to **"My app doesn't provide any financial features"**, keep Category **Food & Drink**, set Health = "no", Government = "no", and use the financial-free listing text in this repo. Full step-by-step values: [`PLAY_CONSOLE_CONTENT_DECLARATIONS.md`](PLAY_CONSOLE_CONTENT_DECLARATIONS.md).
- If the app is still flagged after a clean resubmission, appeal via **Policy status → Help** and name the exact classification (financial/health/VPN/government). Only if Google upholds a classification the app actually has does it require an **organization account** (Option B below).
  - **Option A (individual account — preferred):** declarations corrected (financial=no, category=Food & Drink), listing is customer-facing only, no driver income/earnings/fee language.
  - **Option B (organization account):** necessary only if the app truly becomes a financial/health/VPN/government product. Register a business entity, create a new org Google Play Developer account, transfer the listing, and update the developer name to the org name.

### D.3 No AdMob / no advertising SDK
The app uses **no AdMob and no advertising SDK**. Do **not** declare AdMob in the Data Safety form. The store listing and legal docs must not claim advertising.

### D.4 No hidden sign-in path
Secure sign-in is required before a customer or vendor can access protected functionality. There is no test-login endpoint. An unauthenticated user is redirected to sign-in.

### D.5 Android Go / target API level
- `minSdkVersion` is **24** (Android 7.0). Build `buildArchs` are `armeabi-v7a` and `arm64-v8a`.
- Target API level follows the current Google Play requirement (Android 14+ target as enforced at submission). Keep the target SDK current to avoid new-app / update rejections.
- R8 minification and resource shrinking are enabled for release builds.

### D.6 Foreground service guidance
**Foreground service is DISABLED by default.**
- `expo-location` config: `isAndroidBackgroundLocationEnabled: false` and `isAndroidForegroundServiceEnabled: false`.
- A custom plugin (`withoutLocationForegroundService`) strips unused Android foreground-service permissions.
- Location updates run only while the app is active. If a future feature needs a foreground service or background location, enable it explicitly, update the Privacy Policy (§B.5), update the Data Safety form, and complete the Play Console foreground-service permission declaration **before** submission.

### D.7 Store listing content
- **Full description:** use the tone in `GOOGLE_PLAY_LISTING.md` — fun summoning, real-time tracking, community, convenience; driver benefits described in neutral terms (receive requests, save time). No revenue/earnings/split claims.
- **Tags:** ice cream, ice cream truck, food delivery, local delivery, ice cream delivery, neighborhood, food truck, driver, earnings, side hustle.
- **What's New:** current version notes from `GOOGLE_PLAY_LISTING.md`.
- **Privacy Policy URL:** `https://mgfromthe503.github.io/Ice-cream-man-app/privacy.html` entered in **App content > Privacy policy**.

### D.8 Reviewer flow (app access)
- **Customer:** Continue to secure sign-in → OAuth → choose Customer → tap order button → **Sweet Safety Reminder** appears before delivery details (continuation disabled until parent/guardian acknowledgment) → create request with test-safe location, **Street Name Only** default, confirm delivery.
- **Vendor:** sign in with the approved vendor reviewer identity → open vendor registration (payment required until backend reports a verified entitlement) → complete one-time `icm_vendor_registration` via Play license-testing (no real charge) → confirm success only after server-side verification → complete vendor form; vendor-only actions unavailable to customer identities.

---

## E. Pre-Submission Checklist

> Before each resubmission, confirm:

- [ ] **Data Safety matches implementation.** The form (§C) reflects the actual SDK/network inventory: only **Google Play Billing** and **OpenStreetMap Nominatim** as third-party data recipients; **NO** Phone number, Google Analytics, Google Maps SDK, or AdMob declared. Account deletion is available in-app and through the public request page.
- [ ] **Privacy policy URL is live** at `https://mgfromthe503.github.io/Ice-cream-man-app/privacy.html` (the in-app/public route) and matches `legal/PRIVACY_POLICY.md`.
- [ ] **No test accounts / no reviewer backdoor.** No hidden sign-in path, hard-coded credentials, local payment flags, or payment bypass in the release under review.
- [ ] **Version & versionCode consistent.** `version`/`versionCode` in `app.config.ts` are higher than the last uploaded build.
- [ ] **Cleartext disabled.** HTTP cleartext is disabled (HTTPS-only API/OAuth); the `withoutCleartext` plugin is in place.
- [ ] **Foreground service disabled unless needed.** `isAndroidForegroundServiceEnabled: false` (and background location false) unless a feature genuinely requires them; if enabled, policy + Data Safety + Play declarations are updated to match.
- [ ] **Org-account framing.** Store listing keeps the neutral Food & Drink / ice-cream-finder tone; no financial-intermediary or earnings/split language in the listing.
- [ ] **Email.** All support/contact/legal emails are `mindy.gaines1@gmail.com` — never `support@theicecreamman.app`.

---

## References

- `legal/PRIVACY_POLICY.md` — canonical privacy policy
- `legal/DATA_SAFETY.md` — Play Data Safety form source
- `legal/GOOGLE_PLAY_LISTING.md` — store listing text
- `legal/GOOGLE_PLAY_APP_ACCESS.md` — app-access reviewer prep
- `docs/rejection-response.md` — rejection analysis and org-account decision
- Google Play Console Help: [App access requirements](https://support.google.com/googleplay/android-developer/answer/9859455)
- Android Developers: [Test Google Play Billing](https://developer.android.com/google/play/billing/test)
