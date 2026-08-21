# Red Reaper AI guided local-runtime setup.
# This script never installs or launches a downloaded executable silently.
# It may open the official installer, verify the local runtime, and pull a
# model only when the operator explicitly supplies -Model.

[CmdletBinding()]
param(
    [string]$Model,
    [string]$ModelDirectory,
    [switch]$OpenOfficialInstaller,
    [switch]$StartRuntime
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message)
    Write-Host "[Red Reaper AI] $Message" -ForegroundColor Cyan
}

function Fail-Setup {
    param([string]$Message)
    Write-Error "[Red Reaper AI] $Message"
    exit 1
}

if (-not $IsWindows) {
    Fail-Setup "This guided setup is for Windows. Use the platform-specific local runtime instructions for another operating system."
}

$os = Get-CimInstance -ClassName Win32_OperatingSystem
$computer = Get-CimInstance -ClassName Win32_ComputerSystem
$systemDrive = Get-PSDrive -Name ($env:SystemDrive.TrimEnd(':'))
$freeGb = [math]::Round($systemDrive.Free / 1GB, 1)
$memoryGb = [math]::Round($computer.TotalPhysicalMemory / 1GB, 1)

Write-Step "Detected $($os.Caption), $memoryGb GB RAM, and $freeGb GB free on $($env:SystemDrive)."
Write-Host "Local models may require multiple gigabytes of disk space. Review the model card and licence before downloading." -ForegroundColor Yellow

if ($ModelDirectory) {
    $resolvedDirectory = [Environment]::ExpandEnvironmentVariables($ModelDirectory)
    New-Item -ItemType Directory -Force -Path $resolvedDirectory | Out-Null
    [Environment]::SetEnvironmentVariable("OLLAMA_MODELS", $resolvedDirectory, "User")
    $env:OLLAMA_MODELS = $resolvedDirectory
    Write-Step "Configured OLLAMA_MODELS for this user: $resolvedDirectory"
    Write-Host "Restart the Ollama tray application or open a new terminal before relying on the new model directory." -ForegroundColor Yellow
}

$ollamaCommand = Get-Command ollama -ErrorAction SilentlyContinue
if (-not $ollamaCommand) {
    Write-Host "Ollama is not installed or not currently available in PATH." -ForegroundColor Yellow
    if ($OpenOfficialInstaller) {
        Write-Step "Opening the official Ollama Windows download page. Review and run the installer yourself."
        Start-Process "https://ollama.com/download/windows"
        Write-Host "After installation completes, open a new PowerShell window and run this script again." -ForegroundColor Yellow
    } else {
        Write-Host "Run this script again with -OpenOfficialInstaller to open the official download page." -ForegroundColor Yellow
    }
    exit 0
}

if ($StartRuntime) {
    Write-Step "Starting the local Ollama service."
    Start-Process -FilePath $ollamaCommand.Source -ArgumentList "serve" -WindowStyle Hidden
    Start-Sleep -Seconds 2
}

try {
    $runtime = Invoke-RestMethod -Method Get -Uri "http://127.0.0.1:11434/api/tags" -TimeoutSec 5
    $modelCount = @($runtime.models).Count
    Write-Step "Local runtime is responding on 127.0.0.1:11434 with $modelCount installed model(s)."
} catch {
    Fail-Setup "The Ollama command is available, but the loopback API did not respond. Open the Ollama tray application or rerun with -StartRuntime. Details: $($_.Exception.Message)"
}

if (-not $Model) {
    Write-Host "No model was selected, so no model download was started." -ForegroundColor Yellow
    Write-Host "Example after reviewing its current model card and licence: .\setup-local-runtime.ps1 -Model '<model-tag>'" -ForegroundColor Yellow
    exit 0
}

if ($Model -notmatch '^[a-zA-Z0-9][a-zA-Z0-9._:/-]*$') {
    Fail-Setup "The model tag contains unsupported characters. Supply only a normal local runtime model tag."
}

Write-Host "You requested model '$Model'. This action downloads model files to your local model directory." -ForegroundColor Yellow
$confirmation = Read-Host "Type DOWNLOAD to continue"
if ($confirmation -cne "DOWNLOAD") {
    Write-Step "Model download cancelled."
    exit 0
}

Write-Step "Pulling '$Model' from the configured runtime library."
& $ollamaCommand.Source pull $Model
if ($LASTEXITCODE -ne 0) {
    Fail-Setup "The local runtime reported that the model pull failed."
}

Write-Step "Model '$Model' is installed locally. Red Reaper AI can now be configured to use it from Settings."
