# Red Reaper AI Desktop

Red Reaper AI Desktop is a **local-first Tauri application foundation** for a privacy-aware command center, approved coding workflows, and evidence-led research.

The package intentionally begins with a narrow trust boundary. It renders a professional desktop command center but does not expose arbitrary file-system access, shell execution, local sidecars, microphone capture, cloud-model fallback, or biometric handling.

## Start here

| Need | Read or run |
|---|---|
| Understand the product boundary and technical architecture | [`../../docs/architecture/red-reaper-ai-foundation.md`](../../docs/architecture/red-reaper-ai-foundation.md) |
| Prepare Ollama or another local runtime | [`../../docs/architecture/red-reaper-ai-local-setup.md`](../../docs/architecture/red-reaper-ai-local-setup.md) |
| Review the current UI smoke test | [`../../docs/architecture/red-reaper-ai-validation-notes.md`](../../docs/architecture/red-reaper-ai-validation-notes.md) |
| Start the browser-interface development server | `pnpm install && pnpm desktop:dev` |
| Build the browser interface | `pnpm check && pnpm build` |
| Create a native installer on a prepared Windows development machine | `pnpm desktop:build` |

## Security posture

The application’s native manifest grants only `core:default` to the main window. It deliberately does not grant file-system, process, shell, generic command, sidecar, microphone, or remote-origin permissions. Later features must add a narrowly scoped capability, a user-visible approval, a durable audit entry, and automated tests.

## Visual assets

The Windows icon package is available at [`../../assets/icons/windows/`](../../assets/icons/windows/), with a multi-resolution `.ico` file, PNG sizes, and an `asset-manifest.json`. The source artwork is retained separately at [`../../assets/images/red-reaper-ai-icon-master.png`](../../assets/images/red-reaper-ai-icon-master.png).
