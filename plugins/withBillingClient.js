/**
 * Expo Config Plugin: withBillingClient
 * 
 * Injects Google Play Billing Library 8.1.0 into the Android native build
 * and adds ProGuard/R8 rules to keep BillingClient classes.
 */
const { withAppBuildGradle, withProjectBuildGradle, withDangerousMod } = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

const BILLING_DEPENDENCY = `    implementation "com.android.billingclient:billing:8.1.0"`;
const BILLING_KTX_DEPENDENCY = `    implementation "com.android.billingclient:billing-ktx:8.1.0"`;

/**
 * Add BillingClient dependency to app/build.gradle
 */
function withBillingGradle(config) {
  return withAppBuildGradle(config, (config) => {
    const contents = config.modResults.contents;
    
    // Check if already added
    if (contents.includes("com.android.billingclient:billing:8.1.0")) {
      return config;
    }

    // Find the dependencies block and add our dependency
    const dependenciesRegex = /dependencies\s*\{/;
    if (dependenciesRegex.test(contents)) {
      config.modResults.contents = contents.replace(
        dependenciesRegex,
        `dependencies {\n${BILLING_DEPENDENCY}\n${BILLING_KTX_DEPENDENCY}`
      );
    }

    return config;
  });
}

/**
 * Add ProGuard rules to keep BillingClient classes
 */
function withBillingProguard(config) {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const proguardPath = path.join(
        config.modRequest.platformProjectRoot,
        "app",
        "proguard-rules.pro"
      );

      const proguardRules = `
# Google Play Billing Library - Keep BillingClient classes
-keep class com.android.billingclient.** { *; }
-keep interface com.android.billingclient.** { *; }
-dontwarn com.android.billingclient.**

# expo-iap
-keep class com.dooboolab.rniap.** { *; }
-keep class expo.modules.iap.** { *; }
-dontwarn com.dooboolab.rniap.**
-dontwarn expo.modules.iap.**

# Keep Google Play Core
-keep class com.google.android.play.** { *; }
-dontwarn com.google.android.play.**
`;

      // Read existing content or create new
      let existingContent = "";
      if (fs.existsSync(proguardPath)) {
        existingContent = fs.readFileSync(proguardPath, "utf-8");
      }

      // Only add if not already present
      if (!existingContent.includes("com.android.billingclient")) {
        fs.writeFileSync(proguardPath, existingContent + proguardRules);
      }

      return config;
    },
  ]);
}

/**
 * Enable R8 minification with mapping file in app/build.gradle
 */
function withR8Enabled(config) {
  return withAppBuildGradle(config, (config) => {
    const contents = config.modResults.contents;

    // Look for the release buildType block and ensure minifyEnabled and shrinkResources are true
    // Also ensure proguardFiles includes our custom rules
    if (contents.includes("minifyEnabled")) {
      // Already has minifyEnabled, make sure it's true
      config.modResults.contents = contents
        .replace(/minifyEnabled\s+false/g, "minifyEnabled true")
        .replace(/shrinkResources\s+false/g, "shrinkResources true");
    }

    return config;
  });
}

/**
 * Main plugin export
 */
function withBillingClient(config) {
  config = withBillingGradle(config);
  config = withBillingProguard(config);
  config = withR8Enabled(config);
  return config;
}

module.exports = withBillingClient;
