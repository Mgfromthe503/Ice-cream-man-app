# Red Reaper AI: Windows Download Release Procedure

This procedure produces a downloadable Windows installer for the Red Reaper AI desktop foundation. It is intentionally a two-step process: first build a private workflow artifact for testing, then create a public release only after the installer has been checked on a Windows machine.

> **Public-release warning:** The selected repository is public. Enabling the release option makes the installer and generated release notes publicly accessible to anyone with the repository URL. Do not publish until the source, product name, assets, and installer behaviour are appropriate for public distribution.

## Prerequisites

The `Build Red Reaper AI Windows Installer` workflow must be present on the branch that will be built. The workflow uses a Windows runner to install the declared desktop dependencies, run the TypeScript check, and invoke Tauri’s NSIS bundle target. The generated installer is not code-signed in this foundation; Windows may show a reputation or publisher warning until the release process includes a suitable code-signing certificate.

## Build a test download

In the repository’s **Actions** tab, open **Build Red Reaper AI Windows Installer** and choose **Run workflow**. Keep **Create a public GitHub Release and upload the installer** disabled. When the workflow succeeds, open its **Artifacts** section and download `red-reaper-ai-windows-installer`.

This gives you a one-tap test download without creating a public release page. Extract the artifact, test the `.exe` installer on a Windows computer, and verify the first-launch experience, uninstall path, and local-runtime setup flow.

## Publish a public one-tap installer download

After validating the artifact, run the same workflow again with the release option enabled. Supply a new semantic tag such as `v0.1.0`. The workflow creates a GitHub Release and uploads the NSIS `.exe` as its release asset. The release page then provides the direct browser download for Windows users.

| Workflow input | Test artifact | Public installer release |
|---|---|---|
| `publish_release` | `false` | `true` |
| `release_tag` | Not used for publication | New tag, such as `v0.1.0` |
| Availability | Workflow participants with artifact access | Anyone who can access the public repository |
| Recommended use | First installer validation | Only after successful Windows testing |

## Recovery and rollback

If the test artifact fails, do not enable the release option. Fix the issue on a new branch, rerun the workflow, and repeat the Windows test. If a release asset has already been published and needs to be withdrawn, remove the release asset or delete the release through the repository’s release management interface; this is a public-side effect and should be recorded with the release notes.

## Current boundary

The installer packages the **desktop foundation**: its command-center interface, Jarvis-branded local diagnostics, assets, and capability boundary. It does not yet bundle a language model or offer live local chat, voice capture, Windows Hello authentication, unrestricted coding-agent execution, or hidden background control of the user’s computer.
