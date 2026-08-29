# Play Console Content Declarations — Resubmission Checklist

> **Purpose:** Resolve the **"Some types of apps can only be distributed by organizations"** rejection (Play Console Requirements policy) by making every content declaration **accurately reflect** what the app does, then resubmitting with a fresh build.

## Why the app was rejected

Google Play only requires an **organization account** for these app kinds:
**financial products/services, health apps, apps approved to use `VpnService`, and government apps.**

**The Ice Cream Man does none of these.** It is a **Food & Drink** ice cream-truck dispatch app:
- Payments = Google Play Billing for a **one-time Driver Dashboard access fee** only. No wallet, no money transfer, no lending, no investment, no crypto, no driver payouts. → **Not a financial service.**
- Location sharing is **foreground only**; background location is disabled. → Not a health/VPN/government app.
- It is not a Medical / Health app, does not use `VpnService`, and has no government function.

The rejection fires because content declarations and/or the store listing were read as financial/gig-economy. Fix every declaration below in the **exact** way stated, then resubmit.

---

## 1. Store Settings (right rail → Store settings)

| Field | Set to |
|-------|--------|
| **Category** | **Food & Drink** (NOT Business, NOT Finance, NOT Health & Fitness) |
| **Content rating** | **Everyone** |
| App name | The Ice Cream Man |
| Short description | `Summon an ice cream truck to your neighborhood with a tap and track it live.` |
| Full description | Use `legal/GOOGLE_PLAY_LISTING.md` (financial-free tone) |
| Tags | Use the tag list in `legal/GOOGLE_PLAY_LISTING.md` — **remove `earnings` and `side hustle`** |
| Privacy policy URL | `https://mgfromthe503.github.io/Ice-cream-man-app/privacy.html` |

## 2. App content → Financial features (key fix)

Open **App content → Financial features** and select:

> **"My app doesn't provide any financial features."**

Rationale (accurate): the app uses **Google Play Billing** only for a one-time app-access/registration purchase. Standard in-app purchases are **not** a "financial feature" under the Financial Services policy. Do **not** select "money transfer", "wallet", "trading", "loans", or "crypto".

> If the Console instead shows a **"Purchases with real money"** questionnaire (targeting, etc.), answer truthfully: the app sells digital goods/access via Play Billing; it does not facilitate real-world money exchanges between users.

## 3. App content → Health apps

Open **App content → Health** and select:

> **"My app does not have any health features."**

## 4. App content → Government apps

Open **App content → Government apps** and select **"No"**.

## 5. App content → Data safety

Fill exactly per **`legal/DATA_SAFETY.md`**:
- **No** Phone number · **No** Google Analytics · **No** Google Maps SDK · **No** AdMob / advertising SDK.
- Third-party data recipients are only **Google Play Billing** (purchase metadata) and **OpenStreetMap Nominatim** (GPS for reverse geocoding).
- **Yes** to: encrypted in transit, users can request deletion, in-app account deletion, and the external deletion-request resource.

## 6. App access

Per **`legal/GOOGLE_PLAY_APP_ACCESS.md`**: restricted functionality; provide the reviewer path after testing the exact internal-test AAB under review. No hard-coded reviewer credentials.

## 7. Main content / Targeting & audiences

- **Target audience**: General audience.
- Confirm the app is **not** directed at children (it is a general-audience Food & Drink app). Complete the Families-targeting questionnaire truthfully.
- **Ads**: None. Do not declare ads.

---

## Pre-resubmission build checklist

- [ ] `app.config.ts` `version`/`versionCode` are **higher** than the last rejected build (currently version `1.0.22`, versionCode `10057`). Bump both before submitting.
- [ ] Data safety matches the actual SDK/network inventory.
- [ ] Privacy policy URL is live and matches `legal/PRIVACY_POLICY.md`.
- [ ] External account-deletion request URL: `https://mgfromthe503.github.io/Ice-cream-man-app/account-deletion.html`.
- [ ] No test login / reviewer backdoor in the release.
- [ ] Store listing (above) has **no** earnings/income/fee/split language.
- [ ] Use a **newly built AAB** (EAS `production` build → upload). Do not re-upload the same rejected AAB.

## What if it is still rejected after a clean resubmission?

1. Open **Policy status** → expand the enforcement item → note the exact classification Google names.
2. If Google insists on a **financial/health/VPN/government** classification that the app does not have, submit an appeal/support request via **Help → Contact us** from Policy status. State plainly: *“First-party app; standard Google Play Billing for a one-time in-app access purchase; no financial service, health, VPN, or government function; please identify the specific classification triggering the organization requirement.”*
3. If Play still requires an **organization account**, the only compliant path is **Option B**: convert to an organization account (D-U-N-S + entity verification) and transfer the listing. That is a business decision, not a code change.

## Source links

1. [Play Console Requirements — full policy](https://support.google.com/googleplay/android-developer/answer/10788890?hl=en)
2. [Choose a developer account type](https://support.google.com/googleplay/android-developer/answer/13634885?hl=en)
3. [Financial Services policy](https://support.google.com/googleplay/android-developer/answer/9876821?hl=en)
4. [Check your app's policy status](https://support.google.com/googleplay/android-developer/answer/9842754?hl=en)
