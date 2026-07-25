module.exports = {
  expo: {
    name: 'The Ice Cream Man',
    slug: 'the-ice-cream-man-app',
    version: '1.0.27',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'manusapp',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    android: {
      versionCode: 10027,
      package: 'com.icecreamman.app',
      adaptiveIcon: {
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundColor: '#E6F4FE',
      },
      permissions: [
        'POST_NOTIFICATIONS',
        'com.android.vending.BILLING',
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
      ]
    },
    plugins: [
      'expo-router',
      ['expo-build-properties', {
        android: {
          minSdkVersion: 24,
          enableProguard: true,
          extraBuildGradle: "configurations.all { resolutionStrategy { force 'com.android.billingclient:billing:7.1.1' } }"
        }
      }]
    ],
    extra: {
      eas: {
        projectId: 'a7392ba6-c4a2-455d-b03c-9bc0233b7b12'
      }
    }
  }
};