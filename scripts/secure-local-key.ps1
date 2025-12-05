<#
Secure-local-key.ps1
Helper to protect local certificate files (e.g. localhost.pem / localhost-key.pem).
SAFE GUIDELINES:
- This script does NOT contain private keys. Do NOT hardcode secrets here.
- Commits produced by this script avoid exposing exact secret values.
- Review any git changes before pushing to remote.
It will prompt before making destructive changes (or use -AutoConfirm to skip prompts).
#>
param(
    [switch]$AutoConfirm
)

function Prompt-YesNo($msg){
    if ($AutoConfirm) { return $true }
    $r = Read-Host "$msg [y/N]"
    return $r -match '^(y|Y)'
}

Write-Output "== secure-local-key.ps1 started =="
$pwd = Get-Location
Write-Output "Working dir: $pwd"

$private = "localhost-key.pem"
$cert = "localhost.pem"

# Existence
$existsPrivate = Test-Path .\$private
$existsCert = Test-Path .\$cert
Write-Output "Private key exists: $existsPrivate";
Write-Output "Public cert exists: $existsCert";

# Is tracked by git?
$tracked = $false
try {
    $trackedOut = git ls-files --full-name | Select-String $private -SimpleMatch -Quiet
    if ($?) { $tracked = $true }
} catch {
    Write-Output "Git not available or not a git repo: $_"
}
Write-Output "Tracked by git: $tracked"

# If tracked, prompt to remove from index
if ($tracked) {
    if (Prompt-YesNo "The file '$private' is tracked by Git. Remove from git index (git rm --cached) now?") {
        git rm --cached $private
        # Use a generic commit message to avoid exposing filenames in public history
        git commit -m "chore(security): remove local file from index (local change)" -q
        Write-Output "Removed $private from git index and committed. Note: history still contains the file if it was previously committed."
    } else {
        Write-Output "Skipping git rm --cached"
    }
}

# Ensure .gitignore contains entries
$gi = Get-Content .gitignore -ErrorAction SilentlyContinue
$toAdd = @()
if ($gi -notcontains $private) { $toAdd += $private }
if ($gi -notcontains $cert) { $toAdd += $cert }
if ($toAdd.Count -gt 0) {
    if (Prompt-YesNo "Add $($toAdd -join ', ') to .gitignore and commit?") {
        Add-Content -Path .gitignore -Value "`n# local certs" -Encoding UTF8
        foreach ($item in $toAdd) { Add-Content -Path .gitignore -Value $item -Encoding UTF8 }
        git add .gitignore
        # Generic commit message (do not include secrets or absolute paths)
        git commit -m "chore: ignore local cert files (local change)" -q
        Write-Output ".gitignore updated and committed"
    } else {
        Write-Output "Skipping .gitignore update"
    }
} else { Write-Output ".gitignore already contains local cert entries" }

# Restrict ACLs
if (Test-Path .\$private) {
    if (Prompt-YesNo "Restrict file ACLs for $private to current user?") {
        $u = whoami
        icacls .\$private /inheritance:r | Out-Null
        icacls .\$private /grant:r "$u:(R,W)" | Out-Null
        Write-Output "ACLs updated for $private"
        icacls .\$private
    } else { Write-Output "Skipping ACL changes" }
} else { Write-Output "Private key file not found; skipping ACL step" }

Write-Output "== secure-local-key.ps1 finished =="
