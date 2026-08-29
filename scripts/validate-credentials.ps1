#!/usr/bin/env pwsh
# Credential Validation Script for Ice Cream Man
# Run before any build/deployment: ./scripts/validate-credentials.ps1

$ErrorActionPreference = "Stop"

function Log-Info { param([string]$msg) Write-Host "[INFO] $msg" -ForegroundColor Green }
function Log-Warn { param([string]$msg) Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Log-Error { param([string]$msg) Write-Host "[ERROR] $msg" -ForegroundColor Red }

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ProjectRoot = Split-Path -Parent $ScriptDir

Write-Host "Ice Cream Man - Credential Validation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$Failed = 0

# Ensure eas CLI is in PATH
$env:PATH += ";D:\tools\pnpm-global"

# 1. EXPO_TOKEN validation
Log-Info "Checking EXPO_TOKEN..."
if (Get-Command eas -ErrorAction SilentlyContinue) {
    try {
        $ExpoOutput = & eas whoami 2>&1
        if ($LASTEXITCODE -eq 0 -and $ExpoOutput) {
            Log-Info ("EXPO_TOKEN valid (user: {0})" -f ($ExpoOutput.Trim()))
        } else {
            Log-Error "EXPO_TOKEN invalid or expired"
            Log-Info "Run: eas login"
            $Failed++
        }
    } catch {
        Log-Error ("EXPO_TOKEN check failed: {0}" -f $_)
        $Failed++
    }
} else {
    Log-Error "eas CLI not installed"
    Log-Info "Run: pnpm add -g eas-cli"
    $Failed++
}

# 2. Google Play Service Account
Log-Info "Checking GOOGLE_PLAY_SERVICE_ACCOUNT_JSON..."
if ($env:GOOGLE_PLAY_SERVICE_ACCOUNT_JSON) {
    try {
        $Json = $env:GOOGLE_PLAY_SERVICE_ACCOUNT_JSON | ConvertFrom-Json
        $ClientEmail = $Json.client_email
        Log-Info ("GOOGLE_PLAY_SERVICE_ACCOUNT_JSON valid (client: {0})" -f $ClientEmail)
    } catch {
        Log-Error "GOOGLE_PLAY_SERVICE_ACCOUNT_JSON invalid JSON"
        $Failed++
    }
} else {
    Log-Warn "GOOGLE_PLAY_SERVICE_ACCOUNT_JSON not set in environment"
    Log-Info "Set in GitHub Secrets or export GOOGLE_PLAY_SERVICE_ACCOUNT_JSON='...'"
}

# 3. Android Keystore
Log-Info "Checking Android Keystore..."
$KeystorePath = Join-Path $ProjectRoot "keystore.jks"
if (Test-Path $KeystorePath) {
    if ($env:ANDROID_KEYSTORE_PASSWORD) {
        try {
            keytool -list -keystore $KeystorePath -storepass $env:ANDROID_KEYSTORE_PASSWORD 2>$null | Out-Null
            $Expiry = keytool -list -v -keystore $KeystorePath -storepass $env:ANDROID_KEYSTORE_PASSWORD 2>$null | Select-String "Valid from" | Select-Object -First 1
            if ($Expiry) {
                Log-Info ("Keystore accessible ({0})" -f $Expiry.Line.Trim())
            } else {
                Log-Info "Keystore accessible"
            }
        } catch {
            Log-Error "Keystore password incorrect"
            $Failed++
        }
    } else {
        Log-Warn "ANDROID_KEYSTORE_PASSWORD not set in environment"
    }
} else {
    Log-Warn "keystore.jks not found locally (OK for CI, required for local builds)"
}

# 4. JWT Secret
Log-Info "Checking JWT_SECRET..."
if ($env:JWT_SECRET) {
    $JwtLen = $env:JWT_SECRET.Length
    if ($JwtLen -ge 64) {
        Log-Info ("JWT_SECRET length OK ({0} chars)" -f $JwtLen)
    } else {
        Log-Error ("JWT_SECRET too short ({0} chars, minimum 64)" -f $JwtLen)
        $Failed++
    }
} else {
    Log-Warn "JWT_SECRET not set in environment"
}

# 5. Database URL
Log-Info "Checking DATABASE_URL..."
if ($env:DATABASE_URL) {
    if ($env:DATABASE_URL -like "postgresql://*") {
        Log-Info "DATABASE_URL format OK"
    } else {
        Log-Warn "DATABASE_URL doesn't look like PostgreSQL connection string"
    }
} else {
    Log-Warn "DATABASE_URL not set in environment"
}

# 5. OAuth Credentials
Log-Info "Checking OAuth credentials..."
if ($env:OAUTH_CLIENT_ID -and $env:OAUTH_CLIENT_SECRET) {
    Log-Info "OAuth credentials present"
} else {
    Log-Warn "OAuth credentials not fully set"
}

# Summary
Write-Host ""
Write-Host "========================================"
if ($Failed -eq 0) {
    Log-Info "All critical credentials validated!"
    exit 0
} else {
    Log-Error ("{0} critical credential check(s) failed" -f $Failed)
    Log-Info "Fix the errors above before building/deploying"
    exit 1
}