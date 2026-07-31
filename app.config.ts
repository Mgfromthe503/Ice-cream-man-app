// Load environment variables with proper priority (system > .env)
import "./scripts/load-env.js";
import type { ExpoConfig } from "expo/config";
import {
  APP_BUNDLE_ID,
  APP_NAME,
  APP_SCHEME,
  APP_SLUG,
  EAS_PROJECT_ID,
  EXPO_OWNER,
} from "./config/app-identity.js";

const config: ExpoConfig = {
  name: APP_NAME,
  slug: APP_SLUG,
  owner: EXPO_OWNER,
  version: "1.0.1",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: APP_SCHEME,
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: APP_BUNDLE_ID,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: APP_BUNDLE_ID,
    versionCode: 2,
    permissions: [
      "POST_NOTIFICATIONS",
      "com.android.vending.BILLING",
      "ACCESS_FINE_LOCATION",
      "ACCESS_COARSE_LOCATION",
    ],
    // Queries block for Android 11+ (API 30+) package visibility
    // Required for Linking.openURL() to work with external maps apps
    // Expo's Android config type has not caught up to this manifest field.
    // @ts-expect-error queries is emitted correctly by config plugins/prebuild.
    queries: {
      schemes: ["google.navigation", "geo", "comgooglemaps"],
      packages: ["com.google.android.apps.maps"],
    },
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          {
            scheme: APP_SCHEME,
            host: "*",
          },
        ],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-font",
    "expo-web-browser",
    // Google Play Billing (vendor registration). Requires a dev client / EAS
    // build — not available in Expo Go.
    "react-native-iap",
    [
      "expo-location",
      {
        isAndroidBackgroundLocationEnabled: false,
        isAndroidForegroundServiceEnabled: false,
      },
    ],
    [
      "expo-audio",
      {
        microphonePermission: "Allow $(PRODUCT_NAME) to access your microphone.",
      },
    ],
    [
      "expo-video",
      {
        supportsBackgroundPlayback: true,
        supportsPictureInPicture: true,
      },
    ],
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          backgroundColor: "#000000",
        },
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          // Google Play Billing Library (via react-native-iap) needs Kotlin 2.x.
          // Expo SDK 54 ships compatible defaults; pin explicitly for EAS Gradle.
          kotlinVersion: "2.1.20",
          buildArchs: ["armeabi-v7a", "arm64-v8a"],
          minSdkVersion: 24,
          enableProguardInReleaseBuilds: false,
          enableShrinkResourcesInReleaseBuilds: false,
          // Force latest Google Play Billing Library version
          billingLibraryVersion: "7.0.0",
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    eas: {
      projectId: EAS_PROJECT_ID,
    },
  },
};

export default config;
