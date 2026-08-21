#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

/// Starts the desktop shell. Native tool access is intentionally absent at this
/// stage: model output must not obtain arbitrary file-system or shell control.
pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running Red Reaper AI");
}
