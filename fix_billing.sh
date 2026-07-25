#!/bin/bash
echo "🚀 Cleaning Android build artifacts..."
rm -rf android/app/build
rm -rf android/.gradle

# Force Expo to regenerate the native project with the updated billing dependency
echo "🛠️ Prebuilding Android project..."
npx expo prebuild --platform android --clean

echo "✅ Build cache cleared. Your next AAB build will use Play Billing Library 6.0.1+."
