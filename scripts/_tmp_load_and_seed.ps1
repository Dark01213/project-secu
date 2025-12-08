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
Write-Host 'Loaded env keys summary:'
Get-ChildItem Env: | Where-Object { $_.Name -in @('MANAGER_EMAIL','MANAGER_PASSWORD','SEED_USER_EMAIL','SEED_USER_PASSWORD','MONGODB_URI') } | ForEach-Object { Write-Host $_.Name '=' $_.Value }

Write-Host 'Running create-manager.js'
node scripts/create-manager.js
if ($LASTEXITCODE -ne 0) { Write-Host 'create-manager failed with exit code' $LASTEXITCODE; exit $LASTEXITCODE }

Write-Host 'Running seed-todos.js'
node scripts/seed-todos.js
exit $LASTEXITCODE
