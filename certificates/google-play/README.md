# Android Certificate Registry

This directory contains **public certificates and public fingerprint records only**. It must never contain an Android keystore (`.jks`/`.keystore`), a private key, a keystore password, a key password, a token, or a Google service-account JSON file.

## Required Google Play upload-key certificate

| Field | Verified value |
|---|---|
| Role | **Google Play upload key certificate** for `com.icecreamman.app` |
| Public certificate file | [`google-play-upload-key-certificate.der`](./google-play-upload-key-certificate.der) |
| Subject / issuer | `CN=Manus App` (self-signed) |
| SHA-1 | `89:61:BC:40:53:C1:21:FF:A4:1F:58:46:98:A5:C5:11:4B:9B:2E:BF` |
| SHA-256 | `F1:EB:CF:91:AE:B1:78:C8:E7:92:64:FB:CC:CB:4F:E1:7B:14:BD:25:A6:55:C9:E1:29:12:29:27:A1:9A:77:A5` |
| Certificate file SHA-256 | `f1ebcf91aeb178c8e79264fbcccb4fe17b14bd25a655c9e129122927a19a77a5` |
| Validity | 2026-05-23 through 2126-04-29 (UTC) |
| Verification | The supplied `.der` file was inspected with `keytool -printcert` and its SHA-1/SHA-256 match the Google Play **Upload key certificate** values supplied by the account owner. |

> **Release requirement:** Every `.aab` uploaded to Google Play for this application must be signed using the **private key paired with this public certificate**. The `.der` file proves the identity of that certificate but cannot sign an app bundle.

## Related certificate records

The following certificates are both related to the same app/account release identity, but they have different roles. Keeping both records together avoids losing account-verification context while preventing the wrong certificate from being used to sign a Play upload.

| Role / source | SHA-1 | SHA-256 | Relation to the release |
|---|---|---|---|
| **Google Play upload-key certificate** | `89:61:BC:40:53:C1:21:FF:A4:1F:58:46:98:A5:C5:11:4B:9B:2E:BF` | `F1:EB:CF:91:AE:B1:78:C8:E7:92:64:FB:CC:CB:4F:E1:7B:14:BD:25:A6:55:C9:E1:29:12:29:27:A1:9A:77:A5` | **Required to sign each Google Play upload.** The public certificate file is stored in this directory. |
| **Google-issued deployment / Android Developer verification certificate** | `F5:75:A9:9C:00:7C:8C:D8:55:6C:5A:3F:63:CC:35:D3:53:A3:30:8B` | `3B:FF:15:15:77:68:51:D5:BC:34:3E:D9:4B:DF:18:E4:07:33:28:A3:6F:57:9A:4C:20:4A:CA:8F:BA:27:85:89` | **Related app deployment and developer-verification identity record.** The supplied public certificate is stored as [`google-issued-deployment-certificate.der`](./google-issued-deployment-certificate.der); it is issued to `CN=Android, O=Google Inc.`. Google uses this release-side identity after it accepts a bundle signed by the separate upload key. |
| Current EAS-managed build credential; rejected by Google Play | `BE:D6:3F:D3:DA:34:F1:EF:18:19:68:F9:B0:E0:35:E3:23:1B:E5:7C` | `D1:54:08:BA:A0:F1:A9:CB:00:FA:C9:FE:73:AA:97:D1:E7:2B:E7:D5:3F:3A:62:8E:56:2C:B9:0F:79:44:DD:44` | **Do not use for Play upload.** It is the certificate Google Play reported in the rejected bundle. |

## How the two verified certificates work together

The two validated certificates are both necessary release-identity records, but only one is used by EAS to sign the uploaded `.aab`.

| Stage | Certificate role | Certificate to verify |
|---|---|---|
| EAS builds the Android App Bundle | Upload signing | `google-play-upload-key-certificate.der` — `CN=Manus App`, SHA-1 `89:61:BC:40:53:C1:21:FF:A4:1F:58:46:98:A5:C5:11:4B:9B:2E:BF` |
| Google Play accepts and deploys the release | Google-issued deployment / developer-verification identity | `google-issued-deployment-certificate.der` — `CN=Android, O=Google Inc.`, SHA-1 `F5:75:A9:9C:00:7C:8C:D8:55:6C:5A:3F:63:CC:35:D3:53:A3:30:8B` |

## EAS alignment rule

The EAS Android credential to use for production must expose this exact SHA-1:

```text
89:61:BC:40:53:C1:21:FF:A4:1F:58:46:98:A5:C5:11:4B:9B:2E:BF
```

Do not generate, replace, or upload a new EAS keystore unless it contains the matching private key. If the matching private key is unavailable, use Google Play Console’s **upload-key reset** procedure with a newly generated public certificate; do not replace the key merely because the current EAS credential is different.

## Safe local verification

```sh
keytool -printcert -file certificates/google-play/google-play-upload-key-certificate.der
```

The expected output includes the upload certificate SHA-1 and SHA-256 above. This is a public-certificate check only.

## References

[1]: https://developer.android.com/studio/publish/app-signing "Android Developers: Sign your app"
[2]: https://docs.expo.dev/app-signing/existing-credentials/ "Expo: Using existing credentials"
