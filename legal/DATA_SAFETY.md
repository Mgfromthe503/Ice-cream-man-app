# Google Play Data Safety Declaration

**The Ice Cream Man**
**Developer:** Mindy Gaines
**Package:** com.icecreamman.app

---

## Audience & Children's Privacy (Families Policy)

**The Ice Cream Man is a 13+ app.** It is **not** intended for or directed at children under 13.

- A mandatory **age gate** confirms "Are you 13 or older?" before the app can be used.
- Anyone who indicates they are **under 13 cannot use the app** and is asked to stop.
- **The app does not collect, use, or share any location, personal, or device data from anyone under 13.** Because under-13 users are blocked at the age gate, precisely-located services are only ever used by confirmed 13+ accounts. This keeps the app compliant with Google Play's Families Policy ("Children" audiences and data-handling requirements).

---

## Data Safety Form Responses

### Overview

| Question | Answer |
|----------|--------|
| Does your app collect or share any of the required user data types? | Yes |
| Is all of the user data collected by your app encrypted in transit? | Yes |
| Do you provide a way for users to request that their data is deleted? | Yes |

---

## Data Types Collected

### Location

| Data Type | Collected | Shared | Purpose | Optional |
|-----------|-----------|--------|---------|----------|
| Approximate location | Yes | No | App functionality | No |
| Precise location | Yes | Yes (with other users) | App functionality | No |

> **Precise-location sharing detail:** A customer's precise coordinates are shared with a driver **only** when the customer chooses the "exact address" share mode. In "street only" and "meetup" modes the driver receives rounded (approximately 1 km precision) coordinates. No precise location is ever collected or shared from anyone under 13.

### Personal Info

| Data Type | Collected | Shared | Purpose | Optional |
|-----------|-----------|--------|---------|----------|
| Name | Yes | Yes (with other users) | App functionality | No |
| Email address | Yes | No | Account management | No |
| Phone number | No | No | N/A | N/A |

### Financial Info

| Data Type | Collected | Shared | Purpose | Optional |
|-----------|-----------|--------|---------|----------|
| Purchase history | Yes | No | App functionality | No |
| Other financial info | No | No | N/A | N/A |

### App Activity

| Data Type | Collected | Shared | Purpose | Optional |
|-----------|-----------|--------|---------|----------|
| App interactions | Yes | No | App functionality | No |
| In-app search history | No | No | N/A | N/A |
| Other user-generated content | Yes | No | App functionality | Yes |

### Device or Other IDs

| Data Type | Collected | Shared | Purpose | Optional |
|-----------|-----------|--------|---------|----------|
| Device or other IDs | Yes | No | App functionality (push notifications) | No |

---

## Data Sharing

### Shared with Third Parties

| Third Party | Data Shared | Purpose |
|-------------|-------------|---------|
| Google Play Billing | Purchase transaction metadata (no card details) | Vendor registration fee processing |
| OpenStreetMap Nominatim | GPS coordinates (no user identity) | Reverse geocoding |

The app does **not** embed a Google Maps SDK or a Google Analytics SDK. Tapping "Navigate" in the driver flow opens the user's own external maps application; the app does not send location data to a third-party map SDK for analytics or tracking.

> **Web-only IP geolocation:** The **Android native app does not use IP geolocation** — it is not part of the build reviewed in Play Console and is **not** listed in the Data Safety form. The separately-hosted **web** deployment may obtain an approximate location from the device IP via external IP-lookup services (ipapi.co, ip-api.com, ipwho.is, OpenStreetMap Nominatim). Under-13 users are blocked by the age gate before any of these are reached.

> **Note:** This app does not use Google AdMob or any advertising SDK. Do **not** declare AdMob in the Play Console Data Safety form.

---

## Data Handling Practices

| Practice | Status |
|----------|--------|
| Data encrypted in transit | Yes (HTTPS/TLS) |
| Data encrypted at rest | Yes |
| Users can request data deletion | Yes |
| Data deletion request method | In-app Delete Account or public request page: https://mgfromthe503.github.io/Ice-cream-man-app/account-deletion.html |
| Data retention policy | See Privacy Policy |
| Compliant with Children's Privacy laws | Yes |
| Age gate before data collection | Yes (mandatory 13+ confirmation) |
| Data collected from users under 13 | No (under-13 users are blocked at the age gate) |

---

## Security Practices

| Measure | Implemented |
|---------|-------------|
| HTTPS encryption | Yes |
| Authentication required | Yes |
| Regular security updates | Yes |
| Access controls | Yes |
| Data minimization | Yes |

---

## Instructions for Google Play Console

1. Go to **App content > Data safety**
2. Click **Start**
3. Answer each question using the table above
4. For each data type, select the appropriate collection and sharing options
5. Specify purposes for each data type
6. Review and submit

---

## Privacy Policy URL

Host the Privacy Policy at a publicly accessible URL. The canonical live URL is:
- GitHub Pages: `https://mgfromthe503.github.io/Ice-cream-man-app/privacy.html`

Enter this URL in Google Play Console under **App content > Privacy policy**.

## External Account-Deletion Request Resource

Users who cannot sign in can submit an account and associated-data deletion request at:

`https://mgfromthe503.github.io/Ice-cream-man-app/account-deletion.html`
