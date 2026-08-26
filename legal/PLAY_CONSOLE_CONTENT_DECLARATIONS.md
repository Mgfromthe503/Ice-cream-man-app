# Play Console Organization-Account Investigation

This document records the evidence available for the **Play Console Requirements** rejection of **The Ice Cream Man**. It does **not** prescribe a particular App content answer or claim that changing a declaration resolves the rejection. Play Console may enforce this policy from the app, its listing, its review materials, and the developer account; the rejection wording does not identify the exact field or trigger.

## Verified policy scope

Google's current Play Console Requirements policy limits organization-only distribution to four service types: **financial products and services**, **health apps**, apps approved to use **`VpnService`**, and **government apps**. A Food & Drink category, Google Play Billing integration, a normal payments profile, or a personal developer account are not independently listed as organization-only triggers.

## Repository audit

| Area reviewed | Evidence on the current main branch | Assessment |
| --- | --- | --- |
| Store category | The checked-in listing identifies the app as **Food & Drink**. | Not an organization-only category under the Play Console Requirements policy. |
| Android configuration | The effective Android permissions are notifications, Google Play Billing, fine/coarse location, and audio settings. No health permission or `VpnService` capability is configured. | Does not support a health or VPN classification. |
| Government function | No government affiliation, agency service, or government API is implemented. | Does not support a government-app classification. |
| Financial function | The client uses Google Play Billing only for a one-time Driver Dashboard entitlement. It does not provide a wallet, transfer service, loan, bank account, investment, insurance, or cryptocurrency function. | The repository does not establish a regulated financial-service feature. |
| Misleading client text removed in this branch | The old Driver Terms stated that the app provided an 85/15 revenue split and that Google Play Console paid drivers to linked bank accounts. | Those statements were inaccurate: Google Play pays the developer's own Play proceeds, not the app's drivers. They could make the app appear to facilitate payout or money-transfer activity and have been removed. |

## Required next review step

1. Open **Policy status** for the rejected version and expand the exact enforcement item and its linked email. Preserve a screenshot of the complete **Issue details** section, including every listed area and any reviewer note.
2. If the App content declarations already accurately reflect the app, do **not** toggle them merely to clear an error. Record their current values instead.
3. Compare the store listing, reviewer instructions, and the fresh build against the four organization-only categories above. Ensure they do not state or imply that the app holds, splits, transfers, advances, pays out, or manages driver money.
4. If the enforcement still identifies only **Developer Account** after this correction and no actual organization-only feature exists, submit an appeal or support request through Policy status. State that the app is a Food & Drink dispatch app; it has no health, VPN, government, banking, money-transfer, lending, investment, wallet, insurance, or cryptocurrency feature; and ask Google to identify the specific classification behind the enforcement.
5. Do not repeatedly resubmit the same rejected artifact while the enforcement is unresolved. When Google confirms the classification or the appeal is resolved, use a newly built AAB with a higher version code.

## Source links

1. [Google Play Console Requirements](https://support.google.com/googleplay/android-developer/answer/10788890?hl=en)
2. [Google Play Financial Services policy](https://support.google.com/googleplay/android-developer/answer/9876821?hl=en)
3. [Google Play Payments policy](https://support.google.com/googleplay/android-developer/answer/10281818?hl=en)
4. [Check your app's policy status](https://support.google.com/googleplay/android-developer/answer/9842754?hl=en)
