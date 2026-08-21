<#
.SYNOPSIS
    Tests the health and response latency of a local Jarvis-compatible runtime.

.DESCRIPTION
    Sends repeated HTTP health checks to a loopback endpoint and reports each
    sample plus aggregate latency. An optional inference request can measure
    end-to-end model response latency without embedding a provider name in the
    user-facing Jarvis workflow.

    By default, only localhost / loopback addresses are permitted. This keeps
    diagnostics on the device unless -AllowNonLoopback is explicitly supplied.

.EXAMPLE
    .\test-jarvis-runtime.ps1

.EXAMPLE
    .\test-jarvis-runtime.ps1 -Samples 5 -HealthPath "/api/tags"

.EXAMPLE
    .\test-jarvis-runtime.ps1 `
      -InferencePath "/api/generate" `
      -InferenceRequestJson '{"model":"your-local-model","prompt":"Reply with READY.","stream":false}'
#>

[CmdletBinding()]
param(
    [ValidateNotNullOrEmpty()]
    [uri]$BaseUrl = "http://127.0.0.1:11434",

    [ValidatePattern('^/')]
    [string]$HealthPath = "/api/tags",

    [ValidateRange(1, 20)]
    [int]$Samples = 3,

    [ValidateRange(1, 120)]
    [int]$TimeoutSeconds = 8,

    [ValidatePattern('^/')]
    [string]$InferencePath,

    [string]$InferenceRequestJson,

    [switch]$AllowNonLoopback,

    [string]$ExportJsonPath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Jarvis {
    param(
        [string]$Message,
        [ConsoleColor]$Color = [ConsoleColor]::Cyan
    )

    Write-Host "[Jarvis Runtime] $Message" -ForegroundColor $Color
}

function Get-LoopbackSafeUri {
    param(
        [uri]$RuntimeBaseUrl,
        [string]$Path,
        [bool]$PermitNonLoopback
    )

    if ($RuntimeBaseUrl.Scheme -notin @("http", "https")) {
        throw "Jarvis runtime URLs must use http or https."
    }

    $isLoopback = $RuntimeBaseUrl.IsLoopback -or $RuntimeBaseUrl.DnsSafeHost -in @("localhost", "127.0.0.1", "::1")
    if (-not $isLoopback -and -not $PermitNonLoopback) {
        throw "The target '$($RuntimeBaseUrl.Authority)' is not a loopback address. Use -AllowNonLoopback only when you intentionally want to test a remote runtime."
    }

    return [uri]::new($RuntimeBaseUrl, $Path)
}

function Invoke-JarvisRequest {
    param(
        [System.Net.Http.HttpClient]$Client,
        [ValidateSet("GET", "POST")]
        [string]$Method,
        [uri]$Uri,
        [string]$JsonBody
    )

    $httpMethod = if ($Method -eq "GET") { [System.Net.Http.HttpMethod]::Get } else { [System.Net.Http.HttpMethod]::Post }
    $request = [System.Net.Http.HttpRequestMessage]::new($httpMethod, $Uri)
    if ($Method -eq "POST") {
        $request.Content = [System.Net.Http.StringContent]::new($JsonBody, [System.Text.Encoding]::UTF8, "application/json")
    }

    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        $response = $Client.SendAsync($request).GetAwaiter().GetResult()
        $body = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
    } finally {
        $stopwatch.Stop()
    }

    return [pscustomobject]@{
        Uri             = $Uri.AbsoluteUri
        StatusCode      = [int]$response.StatusCode
        IsSuccessStatus = $response.IsSuccessStatusCode
        LatencyMs       = [math]::Round($stopwatch.Elapsed.TotalMilliseconds, 2)
        PayloadBytes    = [System.Text.Encoding]::UTF8.GetByteCount($body)
        Body            = $body
    }
}

function Get-LatencySummary {
    param([double[]]$LatencyValues)

    $ordered = @($LatencyValues | Sort-Object)
    $middle = [math]::Floor($ordered.Count / 2)
    $median = if ($ordered.Count % 2 -eq 0) {
        ($ordered[$middle - 1] + $ordered[$middle]) / 2
    } else {
        $ordered[$middle]
    }

    return [pscustomobject]@{
        MinMs    = [math]::Round(($ordered | Measure-Object -Minimum).Minimum, 2)
        MedianMs = [math]::Round($median, 2)
        AverageMs = [math]::Round(($ordered | Measure-Object -Average).Average, 2)
        MaxMs    = [math]::Round(($ordered | Measure-Object -Maximum).Maximum, 2)
    }
}

if ([string]::IsNullOrWhiteSpace($InferencePath) -xor [string]::IsNullOrWhiteSpace($InferenceRequestJson)) {
    throw "Supply both -InferencePath and -InferenceRequestJson to measure an inference request, or omit both to run health checks only."
}

$healthUri = Get-LoopbackSafeUri -RuntimeBaseUrl $BaseUrl -Path $HealthPath -PermitNonLoopback $AllowNonLoopback
$inferenceUri = if ($InferencePath) {
    Get-LoopbackSafeUri -RuntimeBaseUrl $BaseUrl -Path $InferencePath -PermitNonLoopback $AllowNonLoopback
}

if ($InferenceRequestJson) {
    try {
        $null = $InferenceRequestJson | ConvertFrom-Json -ErrorAction Stop
    } catch {
        throw "-InferenceRequestJson must be valid JSON. Details: $($_.Exception.Message)"
    }
}

$client = [System.Net.Http.HttpClient]::new()
$client.Timeout = [TimeSpan]::FromSeconds($TimeoutSeconds)
$healthSamples = [System.Collections.Generic.List[object]]::new()
$inferenceResult = $null

try {
    Write-Jarvis "Testing health endpoint $($healthUri.AbsoluteUri) with $Samples sample(s)."

    for ($sampleNumber = 1; $sampleNumber -le $Samples; $sampleNumber++) {
        try {
            $sample = Invoke-JarvisRequest -Client $client -Method "GET" -Uri $healthUri
            $sample | Add-Member -NotePropertyName Sample -NotePropertyValue $sampleNumber
            $healthSamples.Add($sample)

            $color = if ($sample.IsSuccessStatus) { [ConsoleColor]::Green } else { [ConsoleColor]::Yellow }
            Write-Jarvis "Health sample $sampleNumber/$Samples: HTTP $($sample.StatusCode) in $($sample.LatencyMs) ms." $color
        } catch {
            $failure = [pscustomobject]@{
                Sample          = $sampleNumber
                Uri             = $healthUri.AbsoluteUri
                StatusCode      = $null
                IsSuccessStatus = $false
                LatencyMs       = $null
                PayloadBytes    = $null
                Error           = $_.Exception.Message
            }
            $healthSamples.Add($failure)
            Write-Jarvis "Health sample $sampleNumber/$Samples failed: $($_.Exception.Message)" [ConsoleColor]::Red
        }
    }

    $successfulHealthSamples = @($healthSamples | Where-Object { $_.IsSuccessStatus -and $null -ne $_.LatencyMs })
    $latencySummary = if ($successfulHealthSamples.Count -gt 0) {
        Get-LatencySummary -LatencyValues ([double[]]@($successfulHealthSamples | ForEach-Object { $_.LatencyMs }))
    }

    if ($inferenceUri) {
        Write-Jarvis "Testing one Jarvis inference request at $($inferenceUri.AbsoluteUri)."
        try {
            $inferenceResult = Invoke-JarvisRequest -Client $client -Method "POST" -Uri $inferenceUri -JsonBody $InferenceRequestJson
            $color = if ($inferenceResult.IsSuccessStatus) { [ConsoleColor]::Green } else { [ConsoleColor]::Yellow }
            Write-Jarvis "Inference request: HTTP $($inferenceResult.StatusCode) in $($inferenceResult.LatencyMs) ms." $color
        } catch {
            $inferenceResult = [pscustomobject]@{
                Uri             = $inferenceUri.AbsoluteUri
                StatusCode      = $null
                IsSuccessStatus = $false
                LatencyMs       = $null
                PayloadBytes    = $null
                Error           = $_.Exception.Message
            }
            Write-Jarvis "Inference request failed: $($_.Exception.Message)" [ConsoleColor]::Red
        }
    }

    $report = [pscustomobject]@{
        DisplayName            = "Jarvis Local Runtime"
        TestedAtUtc            = [DateTime]::UtcNow.ToString("o")
        BaseUrl                = $BaseUrl.AbsoluteUri.TrimEnd('/')
        HealthEndpoint         = $healthUri.AbsoluteUri
        HealthSamplesRequested = $Samples
        HealthSamplesSucceeded = $successfulHealthSamples.Count
        Healthy                = $successfulHealthSamples.Count -eq $Samples
        HealthLatency          = $latencySummary
        HealthSamples          = $healthSamples
        Inference              = $inferenceResult
    }

    Write-Host ""
    $report | Select-Object DisplayName, TestedAtUtc, BaseUrl, HealthEndpoint, HealthSamplesRequested, HealthSamplesSucceeded, Healthy | Format-List
    if ($latencySummary) {
        Write-Jarvis "Health latency summary — min: $($latencySummary.MinMs) ms; median: $($latencySummary.MedianMs) ms; average: $($latencySummary.AverageMs) ms; max: $($latencySummary.MaxMs) ms." [ConsoleColor]::Green
    } else {
        Write-Jarvis "No successful health response was received." [ConsoleColor]::Red
    }

    if ($ExportJsonPath) {
        $resolvedExport = [Environment]::ExpandEnvironmentVariables($ExportJsonPath)
        $parentDirectory = Split-Path -Parent $resolvedExport
        if ($parentDirectory) {
            New-Item -ItemType Directory -Force -Path $parentDirectory | Out-Null
        }
        $report | ConvertTo-Json -Depth 6 | Set-Content -Path $resolvedExport -Encoding utf8
        Write-Jarvis "Saved diagnostic report to $resolvedExport."
    }

    return $report
} finally {
    $client.Dispose()
}
