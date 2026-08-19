# Android Release Signing Identity

The complete verified release-signing record for `com.icecreamman.app` is documented in [`certificates/google-play/README.md`](./certificates/google-play/README.md). It contains two related public certificates: the **Google Play upload-key certificate** used to sign each EAS-uploaded bundle and the **Google-issued deployment / Android Developer verification certificate** that identifies the release-side deployment record.

| Required Google Play upload-key fingerprint | Value |
|---|---|
| SHA-1 | `89:61:BC:40:53:C1:21:FF:A4:1F:58:46:98:A5:C5:11:4B:9B:2E:BF` |
| SHA-256 | `F1:EB:CF:91:AE:B1:78:C8:E7:92:64:FB:CC:CB:4F:E1:7B:14:BD:25:A6:55:C9:E1:29:12:29:27:A1:9A:77:A5` |

| Related Google-issued deployment / developer-verification certificate | Value |
|---|---|
| SHA-1 | `F5:75:A9:9C:00:7C:8C:D8:55:6C:5A:3F:63:CC:35:D3:53:A3:30:8B` |
| SHA-256 | `3B:FF:15:15:77:68:51:D5:BC:34:3E:D9:4B:DF:18:E4:07:33:28:A3:6F:57:9A:4C:20:4A:CA:8F:BA:27:85:89` |

> The matching **private upload key** is required to sign a Play-uploadable Android App Bundle. It is intentionally not stored in this repository. The current EAS production credential does not match the upload-key values above and must not be used for a Google Play upload.

See the registry for the complete role labels, validation record, and safe EAS alignment rule.
