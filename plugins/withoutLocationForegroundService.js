const { AndroidConfig, withAndroidManifest } = require("expo/config-plugins");

const FOREGROUND_SERVICE_PERMISSIONS = [
  "android.permission.FOREGROUND_SERVICE",
  "android.permission.FOREGROUND_SERVICE_LOCATION",
];

/**
 * expo-location's library manifest can contribute location foreground-service
 * permissions even when the app is configured for foreground-only updates.
 * This project does not start background location tasks, so remove the unused
 * permissions after expo-location has applied its own configuration plugin.
 */
function withoutLocationForegroundService(config) {
  return withAndroidManifest(config, (config) => {
    AndroidConfig.Permissions.removePermissions(
      config.modResults,
      FOREGROUND_SERVICE_PERMISSIONS
    );
    return config;
  });
}

module.exports = withoutLocationForegroundService;
module.exports.FOREGROUND_SERVICE_PERMISSIONS = FOREGROUND_SERVICE_PERMISSIONS;
