# Google Play App Content Declarations

This document records the Play Console answers supported by the current source code and store listing for **The Ice Cream Man**. It is a release-control reference only: the Play Console account owner must enter and save the answers in Play Console before submitting another bundle.

## App identity and purpose

| Field | Approved value |
| --- | --- |
| Android package | `com.icecreamman.app` |
| Store category | Food & Drink |
| App purpose | A local dispatch and marketplace app that connects independent ice-cream vendors with customers requesting physical ice cream deliveries. |
| Regulated financial service | None. The app does not provide banking, lending, wage advances, credit, insurance, money transfers, wallets, investment, cryptocurrency, or financial advice. |

The app's driver dashboard may display business-performance metrics such as hours, completed requests, and estimated earnings. Those analytics do not turn the app into a financial product or service. Google Play Billing is used only for the one-time purchase of in-app Driver Dashboard access; it does not make the app a mobile-payment or digital-wallet provider.

## Required Play Console answers

| Play Console declaration | Answer for the current app | Rationale |
| --- | --- | --- |
| **Financial features** | **My app doesn't provide any financial features** | No listed finance feature is implemented. Do not select *Mobile payments and digital wallets*, *Money transfer and wire services*, *Earned wage advances*, *Other*, or any banking, lending, trading, insurance, or cryptocurrency option merely because the app uses Google Play Billing for app access. |
| **Health apps** | **The app does not have any health features** | The app does not use Health Connect, health permissions, medical features, clinical services, nutrition management, or health research. |
| **Government apps** | **No** | The app is not developed by, for, or on behalf of a government agency. |
| **VPN declaration** | **No** | The Android configuration does not request or use `VpnService`. |
| **App category** | **Food & Drink** | The primary user-facing service is coordination of physical ice cream sales and delivery. |

## Release gate

Before every Play submission, the release owner must compare the built app and listing with these declarations. If the app later adds any in-app customer checkout, driver payout, payment collection, money transfer, lending, insurance, or health/VPN/government functionality, this document and the affected Play Console declarations must be reviewed before release.

> Do not reuse a rejected AAB. After correcting the Play Console declarations, build and upload a new Android App Bundle with a higher version code.

## Repository evidence

The public Expo configuration declares notification, Google Play Billing, and fine/coarse location permissions. It does not declare health permissions or a VPN capability. The approved store listing identifies the product as a **Food & Drink** app. The user-facing driver terms explicitly distinguish the app-access purchase from customer food-order collection and driver payouts.

## Sources

1. [Google Play Console Requirements](https://support.google.com/googleplay/android-developer/answer/10788890?hl=en)
2. [Financial features declaration](https://support.google.com/googleplay/android-developer/answer/13849271?hl=en)
3. [Google Play Payments policy](https://support.google.com/googleplay/android-developer/answer/10281818?hl=en)
4. [Google Play Billing overview](https://developer.android.com/google/play/billing)
