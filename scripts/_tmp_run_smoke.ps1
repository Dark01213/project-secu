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

# Try a list of candidate base URLs (prefer HTTPS), pick the first that responds
$candidates = @($env:BASE, 'https://localhost:3443', 'http://localhost:3000', 'http://localhost:3001') | Where-Object { $_ -ne $null }
$found = $null
foreach ($candidate in $candidates) {
  Write-Host "Probing $candidate ..."
  for ($i=0; $i -lt 10; $i++) {
    try {
      $r = Invoke-WebRequest -Uri $candidate -UseBasicParsing -TimeoutSec 3
      if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 400) { $found = $candidate; break }
    } catch { }
    Start-Sleep -Seconds 1
  }
  if ($found) { break }
}
if ($found) {
  $env:BASE = $found
  Write-Host 'Using base URL:' $env:BASE
} else {
  Write-Host 'Warning: no responsive server found for candidates:'
  $candidates | ForEach-Object { Write-Host " - $_" }
}

Write-Host 'Running smoke-flow script against' $env:BASE
$env:NODE_TLS_REJECT_UNAUTHORIZED = '0'
Write-Host 'NODE_TLS_REJECT_UNAUTHORIZED=' $env:NODE_TLS_REJECT_UNAUTHORIZED
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
