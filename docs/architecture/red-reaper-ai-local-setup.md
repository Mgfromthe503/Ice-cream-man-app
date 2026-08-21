# Red Reaper AI: Local Setup and Developer Workflow

**Audience:** Windows users preparing the local-first desktop assistant foundation.
**Status:** Setup instructions for the initial foundation; it does not yet produce a signed Windows installer or ship a bundled language model.

## What “one-touch” means in this foundation

Red Reaper AI offers a **guided local setup** rather than an opaque installer. A single PowerShell command can assess the machine, open the official runtime download page when needed, verify a loopback-only runtime, and optionally download a model after the user types an explicit confirmation. It never silently runs a downloaded executable, sends prompts to a cloud provider, or fetches a model without notice.

Ollama’s official Windows documentation states that its application runs natively on Windows, exposes the local service on `localhost:11434`, and permits a user-defined model directory through `OLLAMA_MODELS`. It also warns that local models can consume tens to hundreds of gigabytes of storage. [1] Its Windows installer operates in the user account by default and does not require administrator rights. [1]

| Setup choice | Result | Cost and privacy implication |
|---|---|---|
| **Desktop shell only** | You can use the visual command center and inspect its trust boundaries. | No model download and no third-party AI API required. |
| **Local runtime, no model** | The app can health-check the loopback endpoint while you decide which model licence and size suits the machine. | No paid API; no AI inference until a model is installed. |
| **Local runtime with a selected model** | The runtime can serve a model entirely on the computer. | Model downloads use local disk/RAM/VRAM and must be reviewed for licence suitability. |
| **Optional cloud provider later** | A future user-selected integration could use a remote model. | Not included or enabled by this foundation; it may introduce usage costs and transfers data outside the device. |

## Prerequisites

The desktop shell is intended for Windows 10 version 22H2 or later, or Windows 11. The local model runtime must be installed separately. The official runtime documentation lists compatible NVIDIA and AMD acceleration paths but does not guarantee a particular model will be fast or fit on every device. [1]

To develop the desktop application itself, install Node.js 22+, pnpm 11+, Rust/Cargo, and the Windows desktop build prerequisites required by Tauri. This sandbox could validate the web interface but could not validate native packaging because it lacks Rust/Cargo and a Windows target.

## Guided runtime setup

Open PowerShell in the repository root and run the following script. The first command opens the official download page only when the runtime is not already available; it does not automatically install anything.

```powershell
.\apps\red-reaper-desktop\scripts\setup-local-runtime.ps1 -OpenOfficialInstaller
```

After installing the runtime and opening a new PowerShell session, verify the local service:

```powershell
.\apps\red-reaper-desktop\scripts\setup-local-runtime.ps1 -StartRuntime
```

If the system drive lacks space, store model files in a different user-controlled folder. The runtime must be restarted after changing the user-level environment variable. [1]

```powershell
.\apps\red-reaper-desktop\scripts\setup-local-runtime.ps1 `
  -ModelDirectory "D:\RedReaperAI\models" `
  -StartRuntime
```

### Selecting a coding model deliberately

Do **not** treat any model as a universal autonomous developer. Choose a model after checking its current model card, licence, download size, context length, and the machine’s available memory. For example, the current Qwen3-Coder-Next page describes it as coding-focused and compatible with coding-agent workflows, but the listed quantized download is 52 GB; that is intentionally not made the default in the setup script. [2]

After reviewing a model’s card and licence, pass its exact tag to the script. It will show the model name and ask you to type `DOWNLOAD` before pulling it.

```powershell
.\apps\red-reaper-desktop\scripts\setup-local-runtime.ps1 `
  -StartRuntime `
  -Model "<reviewed-model-tag>"
```

The script sends runtime traffic only to `127.0.0.1:11434`, validates the model-tag characters, and does not record a remote API key.

## Jarvis health and latency diagnostics

Use `test-jarvis-runtime.ps1` as the user-facing diagnostic for the assistant. It identifies the tested service as **Jarvis Local Runtime** and does not require the backend implementation to appear in the output. By default it tests only a loopback address and performs three `GET` health samples against the configured endpoint.

```powershell
.\apps\red-reaper-desktop\scripts\test-jarvis-runtime.ps1
```

The default is compatible with a local service available at `http://127.0.0.1:11434/api/tags`. A future Jarvis runtime wrapper can use a different local port and health route without changing the product name:

```powershell
.\apps\red-reaper-desktop\scripts\test-jarvis-runtime.ps1 `
  -BaseUrl "http://127.0.0.1:8080" `
  -HealthPath "/health" `
  -Samples 5 `
  -ExportJsonPath "$env:USERPROFILE\Documents\jarvis-runtime-report.json"
```

To measure one end-to-end response, provide both the relative request path and a valid JSON request body expected by the selected local compatibility layer. The script reports HTTP status, payload size, health min/median/average/max latency, and optional inference latency; it does not print the model response body.

```powershell
.\apps\red-reaper-desktop\scripts\test-jarvis-runtime.ps1 `
  -InferencePath "/api/generate" `
  -InferenceRequestJson '{"model":"your-local-model","prompt":"Reply with READY.","stream":false}'
```

`-AllowNonLoopback` is intentionally required before targeting a LAN or remote address. Use it only when you deliberately intend to test a service outside the computer.

## Running the desktop foundation

The desktop package is deliberately isolated from the legacy Expo application at the repository root. From the package directory, install its declared dependencies and start the visual command center:

```powershell
cd .\apps\red-reaper-desktop
pnpm install
pnpm desktop:dev
```

For a production web-interface build and static type check:

```powershell
pnpm check
pnpm build
```

To produce a native Windows installer once Rust and the Windows toolchain are installed:

```powershell
pnpm desktop:build
```

The package uses a Tauri capability manifest that intentionally grants only the default application core permissions. There is **no** file-system, shell, process, sidecar, or remote API permission in the foundation. Tauri’s capability model is intended to constrain what a specific window or WebView can access. [3]

## Coding-agent workflow

The initial code workspace is designed around a four-stage loop. It does not grant an LLM unrestricted computer control.

| Stage | User action | Agent boundary |
|---|---|---|
| **1. Select** | Choose a project directory explicitly. | The assistant sees only that project, not the entire disk. |
| **2. Plan** | Ask for a solution plan and review it. | The assistant may read approved context but cannot edit code or run commands. |
| **3. Diff** | Ask for a patch and inspect the exact unified diff. | No files change until you approve the diff. |
| **4. Verify** | Choose a displayed validation command and approve it. | The exact command, directory, result, and timestamp appear in the local audit trail. |

This plan-first model follows the safe interaction pattern documented by OpenCode: users can request a plan before build mode and undo resulting changes. Red Reaper AI will implement the concept with its own approval controls rather than silently delegating system authority. [4]

## Voice and Windows Hello

Voice is not required for the first run. The planned speech layer uses explicit push-to-talk and a local speech-to-text engine; microphone capture stays disabled until the user turns it on. The `whisper.cpp` project supports local inference with CPU and several acceleration paths, including Windows. [5]

Windows facial recognition should remain an **optional OS-owned re-authentication step** for privileged actions. The app must never save face templates, imitate a biometric database, or use ordinary camera-based face matching. Windows Hello is designed to keep biometric data on the device, and face authentication depends on compatible infrared hardware. [6]

## Known limits and next engineering work

| Capability | Foundation status | Next safe implementation step |
|---|---|---|
| Native installer | Configuration and icons are prepared; binary build not performed in this Linux sandbox. | Build and test the Windows NSIS/WiX package on a Windows machine with Rust. |
| Local chat | UX and runtime status boundary are present; a model adapter is not yet connected. | Implement a loopback-only Jarvis adapter with model discovery and response streaming behind a configurable compatibility layer. |
| Coding tools | The plan/diff/approval workflow is specified; no arbitrary command executor exists. | Add folder-scoped read access, diff preview, a path allowlist, and per-command confirmation. |
| Voice | Architecture only. | Add an off-by-default push-to-talk adapter and an audio-deletion control. |
| Windows Hello | Architecture only. | Integrate supported Windows authentication for a local vault and privileged-action re-authentication. |
| Research | Evidence-led UI concept only. | Add visible source logs and per-host network approvals; exclude surveillance and intrusion features. |

## References

[1]: https://docs.ollama.com/windows "Ollama — Windows"
[2]: https://ollama.com/library/qwen3-coder-next "Ollama — Qwen3-Coder-Next"
[3]: https://v2.tauri.app/security/capabilities/ "Tauri v2 — Capabilities"
[4]: https://opencode.ai/docs/ "OpenCode — Documentation"
[5]: https://github.com/ggml-org/whisper.cpp "whisper.cpp — repository"
[6]: https://learn.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/ "Microsoft Learn — Windows Hello for Business"
