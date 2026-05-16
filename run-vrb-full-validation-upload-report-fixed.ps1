param(
  [switch]$IncludeDiff
)

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

$Root = (Get-Location).Path
$ArtifactsDir = Join-Path $Root "artifacts"
if (!(Test-Path $ArtifactsDir)) {
  New-Item -ItemType Directory -Path $ArtifactsDir | Out-Null
}

function Invoke-Capture {
  param(
    [Parameter(Mandatory = $true)][string]$Command
  )
  $output = @()
  try {
    $output = & cmd.exe /d /s /c $Command 2>&1
    $code = $LASTEXITCODE
    if ($null -eq $code) { $code = 0 }
    return [pscustomobject]@{
      ExitCode = [int]$code
      Output = ($output | Out-String)
    }
  } catch {
    return [pscustomobject]@{
      ExitCode = 999
      Output = $_.Exception.ToString()
    }
  }
}

function Get-AppVersion {
  $r = Invoke-Capture -Command "node -p \"require('./package.json').version\""
  if ($r.ExitCode -eq 0) {
    $v = ($r.Output.Trim() -split "`r?`n")[-1].Trim()
    if ($v) { return $v }
  }
  return "unknown"
}

$Version = Get-AppVersion
$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$ReportPath = Join-Path $ArtifactsDir "VRB_UPLOAD_REPORT_v${Version}_${Timestamp}.md"
$Summary = @()

function Add-Text {
  param([string]$Text = "")
  Add-Content -LiteralPath $ReportPath -Value $Text -Encoding UTF8
}

function Add-CodeBlock {
  param(
    [string]$Language,
    [string]$Content
  )
  Add-Text "``````$Language"
  if ($null -ne $Content -and $Content.Length -gt 0) {
    Add-Text $Content.TrimEnd()
  }
  Add-Text "``````"
}

function Run-Step {
  param(
    [Parameter(Mandatory = $true)][string]$Name,
    [Parameter(Mandatory = $true)][string]$Command
  )

  Write-Host "Running: $Name"
  $start = Get-Date
  $result = Invoke-Capture -Command $Command
  $end = Get-Date
  $seconds = [Math]::Round(($end - $start).TotalSeconds, 2)
  $status = if ($result.ExitCode -eq 0) { "PASS" } else { "FAIL" }

  $script:Summary += [pscustomobject]@{
    Name = $Name
    Command = $Command
    Status = $status
    ExitCode = $result.ExitCode
    Seconds = $seconds
  }

  Add-Text ""
  Add-Text "## $Name"
  Add-Text ""
  Add-Text "- Status: $status"
  Add-Text "- Exit code: $($result.ExitCode)"
  Add-Text "- Duration seconds: $seconds"
  Add-Text "- Command: ``$Command``"
  Add-Text ""
  Add-CodeBlock -Language "text" -Content $result.Output
}

"# VRB full validation upload report" | Set-Content -LiteralPath $ReportPath -Encoding UTF8
Add-Text ""
Add-Text "- Generated at: $(Get-Date -Format o)"
Add-Text "- Repo root: $Root"
Add-Text "- App version: $Version"
Add-Text "- Report path: $ReportPath"
Add-Text ""

Run-Step -Name "Environment - Node version" -Command "node --version"
Run-Step -Name "Environment - npm version" -Command "npm --version"
Run-Step -Name "Package version" -Command "node -p \"require('./package.json').version\""
Run-Step -Name "Package scripts snapshot" -Command "node -e \"const p=require('./package.json'); console.log(JSON.stringify({version:p.version,scripts:Object.keys(p.scripts||{}).sort()}, null, 2))\""
Run-Step -Name "Root patch script hygiene" -Command "powershell -NoProfile -Command \"Get-ChildItem . -File -Include 'apply-v*.py','fix-v*.py','fix-*.py' | Select-Object Name,Length,LastWriteTime | Format-Table -AutoSize\""

$ValidationSteps = @(
  [pscustomobject]@{ Name = "Evidence Pack v2 contract"; Command = "npm run evidence-pack:v2:check" },
  [pscustomobject]@{ Name = "Creator Workflow MVP"; Command = "npm run creator-workflow:mvp:check" },
  [pscustomobject]@{ Name = "Creator Workflow Interaction"; Command = "npm run creator-workflow:interaction:check" },
  [pscustomobject]@{ Name = "Creator Workflow Usability"; Command = "npm run creator-workflow:usability:check" },
  [pscustomobject]@{ Name = "Creator Session Quality"; Command = "npm run creator-session:quality:check" },
  [pscustomobject]@{ Name = "Route Surface Integrity"; Command = "npm run route-surface:check" },
  [pscustomobject]@{ Name = "Lint"; Command = "npm run lint" },
  [pscustomobject]@{ Name = "Full QA"; Command = "npm run qa" },
  [pscustomobject]@{ Name = "Typecheck"; Command = "npm run typecheck" },
  [pscustomobject]@{ Name = "CI parity"; Command = "npm run verify:ci-parity" }
)

foreach ($step in $ValidationSteps) {
  Run-Step -Name $step.Name -Command $step.Command
}

Run-Step -Name "Git status short" -Command "git status --short"
Run-Step -Name "Git diff stat" -Command "git diff --stat"
Run-Step -Name "Artifact freshness snapshot" -Command "powershell -NoProfile -Command \"Get-ChildItem artifacts -File | Sort-Object LastWriteTime -Descending | Select-Object -First 40 Name,Length,LastWriteTime | Format-Table -AutoSize\""

if ($IncludeDiff) {
  Run-Step -Name "Git diff full" -Command "git diff -- . ':!package-lock.json'"
}

Add-Text ""
Add-Text "# Summary"
Add-Text ""
Add-Text "| Status | Exit | Seconds | Step |"
Add-Text "|---|---:|---:|---|"
foreach ($item in $Summary) {
  $safeName = $item.Name.Replace("|", "-")
  Add-Text "| $($item.Status) | $($item.ExitCode) | $($item.Seconds) | $safeName |"
}

$Failed = @($Summary | Where-Object { $_.ExitCode -ne 0 })
Add-Text ""
if ($Failed.Count -eq 0) {
  Add-Text "Overall: PASS"
  Write-Host ""
  Write-Host "Report written: $ReportPath"
  Write-Host "Overall: PASS - upload the report if you want review/confirmation."
  exit 0
} else {
  Add-Text "Overall: FAIL"
  Add-Text ""
  Add-Text "Failed steps:"
  foreach ($f in $Failed) {
    Add-Text "- $($f.Name): exit $($f.ExitCode)"
  }
  Write-Host ""
  Write-Host "Report written: $ReportPath"
  Write-Host "Overall: FAIL - upload the report above."
  exit 1
}
