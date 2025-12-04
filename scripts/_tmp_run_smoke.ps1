# param must appear at the top of the script for PowerShell
param([string]$BaseUrl = 'https://localhost:3443')
$env:BASE = $BaseUrl

# Load .env (skip code fences)
$lines = Get-Content .env
foreach ($line in $lines) {
  $l = $line.Trim()
  if ($l -eq '' -or $l.StartsWith('#') -or $l.StartsWith('```')) { continue }
  if ($l -match '=') {
    $parts = $l -split '=',2
    $name = $parts[0].Trim()
    $value = $parts[1].Trim()
    if ($value.StartsWith('"') -and $value.EndsWith('"')) { $value = $value.Trim('"') }
    if ($value.StartsWith("'") -and $value.EndsWith("'")) { $value = $value.Trim("'") }
    Set-Item -Path Env:$name -Value $value
  }
}
Write-Host 'BASE=' $env:BASE

# Wait for server to be ready (max 30s)
$ready = $false
for ($i=0; $i -lt 30; $i++) {
  try {
    $r = Invoke-WebRequest -Uri $env:BASE -UseBasicParsing -TimeoutSec 3
    if ($r.StatusCode -eq 200) { $ready = $true; break }
  } catch { }
  Start-Sleep -Seconds 1
}
if (-not $ready) { Write-Host 'Warning: server not responding at' $env:BASE }

Write-Host 'Running smoke-flow script against' $env:BASE
node scripts/smoke-flow.js
$rc = $LASTEXITCODE
if ($rc -eq 0) {
  Write-Host 'Smoke flow succeeded; removing .env'
  Remove-Item .env -Force -ErrorAction SilentlyContinue
  Write-Host '.env removed'
} else {
  Write-Host 'Smoke flow failed (exit code' $rc '); leaving .env for debugging.'
}
exit $rc
