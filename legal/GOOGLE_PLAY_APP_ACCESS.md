# Google Play Console — App Access Instructions for Reviewers

## App Access Status
The Ice Cream Man requires **secure sign-in** before accessing customer or driver functionality. This app uses **OAuth authentication** (Google Sign-In) — no test accounts or hardcoded credentials exist.

---

## For Google Play Reviewers: How to Sign In & Test

### Prerequisites (One-Time Setup by Developer)
Before submitting for review, the developer will:
1. **Add your Google account** to the Play Console **License Testing** list
2. **Enable** the `icm_vendor_registration` test product for the internal testing track
3. **Verify** OAuth sign-in works with test accounts

---

## Step-by-Step Reviewer Login Instructions

### 1. Install the Internal Test Build
1. You will receive an email from **Google Play Console** with an invitation to test **The Ice Cream Man (Internal Testing)**
2. Click the link → **Install** the app on your Android device
3. Open the app

### 2. Confirm You Are 13 or Older (Age Gate)
1. On the **Welcome / age gate screen**, tap **"Yes, I'm 13 or older"**
2. You are then taken to the **role selection** screen

> **Note:** The Ice Cream Man is a **13+ app**. Anyone under 13 cannot use the app and is not asked to share any location. This gate keeps the app compliant with Google Play Families Policy.

### 3. Sign In with Your Google Account
1. On the **Welcome screen**, tap **"Continue to secure sign-in"**
2. **Choose your Google account** from the account picker (use the same account added to License Testing)
3. **Grant permissions** when prompted (location, notifications)
4. You will be redirected back to the app — **signed in securely**

> **No passwords needed** — OAuth handles authentication securely.

---

### 4. Test as a Customer
1. After sign-in, select **"Customer"** on the role selection screen
2. Tap the **large ice cream button** on the home screen
3. **Sweet Safety Reminder** appears — **select the parent/guardian acknowledgment checkbox**
4. The **Continue** button enables — tap it
5. Choose **delivery location** (use test-safe location, e.g., your office)
6. **Street Name Only** is selected by default — keep it or change as desired
7. Tap **"Confirm Request"**
8. **Verify**: Request appears, driver matching works, cancellation works

---

### 5. Test as a Driver (Vendor)
1. Sign out (Profile → Logout) → Sign in again with your **License Testing Google account**
2. Select **"Ice Cream Vendor"** on role selection
3. **Vendor Registration** screen appears — shows **$25 one-time registration fee**
4. Tap **"Pay $25 Registration"** → **Google Play license test purchase flow opens**
5. **Complete test purchase** (no real charge — license test account)
6. App verifies purchase with backend → **Registration unlocks**
7. Complete **vendor profile** (truck name, license plate, coverage zip code)
8. **Verify**: Dashboard shows incoming requests, map navigation works

---

### 6. Test In-App Purchase Restore
1. Sign out → Sign in again with **same License Testing account**
2. Select **"Ice Cream Vendor"**
3. App detects existing purchase → **"Restore Purchase"** button appears
4. Tap **"Restore Purchase"** → Backend re-verifies → Access restored

---

## Support Contact for Reviewers
If you encounter any issues during testing:

| Method | Contact |
|--------|---------|
| **Email** | `mindy.gaines1@gmail.com` |
| **Response Time** | Within 4 hours (business hours) |
| **Subject Line** | `PLAY REVIEW: The Ice Cream Man - [Brief Issue]` |

---

## What NOT to Do
- ❌ Do not use personal accounts not on License Testing list
- ❌ Do not attempt to bypass sign-in (no test-login endpoints exist)
- ❌ Do not use real payment methods — only license test purchases
- ❌ Do not share reviewer credentials with anyone

---

## App Behavior Quick Reference

| Feature | How to Test |
|---------|-------------|
| **OAuth Sign-In** | Google account picker → choose License Testing account |
| **Customer Request** | Tap big button → Safety acknowledgment → Location → Confirm |
| **Driver Registration** | Role: Vendor → Pay $25 (license test) → Profile form |
| **In-App Purchase** | License test → No real charge → Backend verifies |
| **Location Sharing** | Customer: 3 modes (Exact/Street/Meetup) → Driver: real-time |
| **Safety Features** | Parent acknowledgment required • Street Name default • Safety Guide accessible |

---

## Version Information
- **App Version**: 1.0.24 (versionCode via EAS auto-increment)
- **Package**: `com.icecreamman.app`
- **Test Track**: Internal Testing
- **Last Updated**: August 29, 2026

---

## Developer Commitment
This app follows **Google Play policies**:
- ✅ No hidden test accounts or backdoors
- ✅ No hardcoded credentials
- ✅ OAuth-only authentication
- ✅ License test purchases only
- ✅ Privacy Policy live & accessible
- ✅ Data Safety form matches actual practices
- ✅ Child safety acknowledgments implemented

---

**Questions?** Contact `mindy.gaines1@gmail.com` — we respond within 4 hours during business hours.