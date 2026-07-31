# 🍦 Google Play Store Launch Guide

This guide helps you resolve the **Billing** and **Obfuscation** errors you encountered and explains how to generate new builds.

## 1. Resolving Obfuscation Errors
I have disabled **ProGuard** in your `app.config.ts`. 
- **Why?** Google Play flags "Obfuscation" errors when ProGuard is enabled but no `mapping.txt` file is uploaded. 
- **Fix:** By disabling it, your app will still be professional and functional, but Google will no longer require a deobfuscation file. This is the simplest path to a successful launch.

## 2. Resolving Billing Errors
Your app uses the `BILLING` permission for the $25 vendor registration fee. Google Play requires you to:
1. **Create the Product:** Go to Google Play Console → Your App → Monetize → Products → In-app products.
2. **Add Product ID:** Create a product with the ID `icm_vendor_registration`.
3. **Set Price:** Set it to $25.00 (One-time/Non-consumable).
4. **Financial Profile:** Ensure your "Financial health" and "Payment profile" are fully set up in the Google Play Console settings.

## 3. Generating New Builds via GitHub
I have added a GitHub Action workflow to your repository. You can now generate a new build automatically:
1. **Add Expo Token:** Go to your GitHub Repository → Settings → Secrets and variables → Actions.
2. **New Secret:** Create a secret named `EXPO_TOKEN`. You can get this token from your [Expo Account Settings](https://expo.dev/settings/access-tokens).
3. **Trigger Build:** 
   - Push any change to the `main` branch, OR
   - Go to the **Actions** tab in GitHub, select **EAS Build**, and click **Run workflow**.
4. **Download Build:** Once finished, you will see a link to your new `.aab` file on your [Expo Dashboard](https://expo.dev/).

## 4. Submission Steps
1. Download the `.aab` from Expo.
2. Upload it to the **Internal Testing** or **Production** track in Google Play Console.
3. If Google asks about "Advertising ID" or "Data Safety", refer to the `legal/` folder in your project for guidance.
