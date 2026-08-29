# Child Safety and Parent Guidance

**The Ice Cream Man** is a **13+** Food & Drink dispatch app for a general audience. It is **not a child-directed service**, and it is **not designed for or usable by anyone under 13**. A mandatory **age gate** asks "Are you 13 or older?" before the app can be used; anyone under 13 cannot use the app and is not asked to share any location. A parent or guardian decides whether a minor aged 13+ may use the app and should approve and supervise any neighborhood request.

> This document and the in-app reminder are practical safety measures. They are not legal advice, age verification, verifiable parental consent, or a guarantee of safety. The developer must obtain qualified legal advice before changing the Play Console target audience, age range, data practices, or features that may be used by children.

## In-app safety behavior

Before every customer request can advance to delivery details, the app displays a **Sweet Safety Reminder**. The user must actively acknowledge that a parent or guardian knows about the request before continuing. The acknowledgment is intentionally per-request and is not stored as age or parental-consent data.

| Safeguard | Behavior |
|---|---|
| Parent-aware acknowledgment | A request cannot advance to delivery details until the user checks the parent/guardian acknowledgment. |
| Safer location default | **Street Name Only** remains the default sharing option. Exact address sharing is an explicit choice. |
| Plain-language warning | The reminder tells users to ask a parent or guardian, use a familiar public meetup point where appropriate, wait with a trusted adult, protect private information, and cancel/tell an adult if something feels wrong. |
| Persistent access | The customer home screen offers a **Safety & Parent Guide** entry point. |
| Rotating reminders | The existing fact ticker rotates calm safety tips alongside ice-cream facts. It uses fade/slide motion only, not flashing or urgent attention-grabbing effects. |
| Data minimization reminder | The delivery-details screen asks users not to place phone numbers, school details, or other private information in order notes. |

## Parent and guardian guidance

A parent or guardian should handle or approve the request, choose the location-sharing option suitable for the family, and remain responsible for supervision and local safety decisions. A family should use a familiar pickup location, be alert around vehicles and driveways, and cancel a request if the situation becomes uncomfortable or unsafe.

The app does not represent that it conducts vendor screening or that its safety reminder replaces supervision. Existing Terms, Privacy Policy, vendor disclosure, local laws, and emergency procedures continue to apply.

## Google Play review checklist

The release owner should confirm that the Play Console **Target audience and content**, **Data safety**, **privacy policy**, **content rating**, and **App access** entries accurately reflect the released artifact. The developer must not classify the app as solely child-directed while it requests or collects precise location. If children are intentionally added to the target audience, the developer must reassess all applicable Google Play Families requirements and obtain legal advice before release.

### Reviewer path

1. Sign in with the approved reviewer identity and choose **Customer**.
2. On the customer home screen, tap the large ice-cream order button.
3. Observe the **Sweet Safety Reminder** before the delivery-details modal appears.
4. Confirm that the continuation button remains disabled until the acknowledgment is selected.
5. Select the acknowledgment and continue. Confirm that **Street Name Only** is selected by default and the delivery-details safety note is visible.
6. Tap **Safety & Parent Guide** from the home screen to view the reminder without beginning a request.
7. Wait on the customer home screen to observe rotating safety tips in the fact ticker.

## References

[1]: https://support.google.com/googleplay/android-developer/answer/9893335 "Google Play Families Policies"
[2]: https://support.google.com/googleplay/android-developer/answer/9859455 "Prepare your app for review"
[3]: https://support.google.com/googleplay/android-developer/answer/10787469 "Provide information for Google Play's Data safety section"
