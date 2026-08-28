const { withAndroidManifest } = require("expo/config-plugins");

/**
 * Disables cleartext (plain HTTP) traffic on Android.
 *
 * The app's API and OAuth backends are HTTPS-only. On minSdk 24-27 cleartext is
 * permitted by default unless explicitly disabled, so this enforces
 * usesCleartextTraffic="false" to prevent accidental insecure data transmission
 * (Google Play network-security best practice).
 */
function withoutCleartext(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const application = (manifest.manifest && manifest.manifest.application) || [];
    for (const app of application) {
      if (app && !app.$) continue;
      app.$ = app.$ || {};
      app.$["android:usesCleartextTraffic"] = "false";
    }
    return config;
  });
}

module.exports = withoutCleartext;
