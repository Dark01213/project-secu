param(
    [switch]$WhatIf
)

function OutOk($m){ Write-Host "[OK] $m" -ForegroundColor Green }
function OutErr($m){ Write-Host "[ERR] $m" -ForegroundColor Red }

Write-Host "=== Purge Git history helper (git-filter-repo) ==="

if((git rev-parse --is-inside-work-tree) -ne 'true'){
    OutErr 'This script must be run from the repository root.'; exit 1
}

# files to remove from history
$pathsToRemove = @('audits/secret-scan-history.txt','localhost.pem','localhost-key.pem')
Write-Host "Will remove paths: $($pathsToRemove -join ', ')"

if(-not $WhatIf){
    $confirm = Read-Host "Proceed? This will rewrite history and require force-push (yes/no)"
    if($confirm -ne 'yes'){ Write-Host 'Aborted by user.'; exit 0 }
}

# ensure working tree clean, stash if needed
$status = git status --porcelain
if($status){
    Write-Host 'Working tree not clean — stashing current changes.'
    git stash push -u -m 'wip-before-filter-repo'
    $stashed = $true
} else { $stashed = $false }

# check git-filter-repo availability
try { git filter-repo --version > $null 2>$null; $gr = $true } catch { $gr = $false }
if(-not $gr){
    OutErr 'git-filter-repo not found. Install it first and re-run this script.'
    OutHost 'Install suggestion (PowerShell + Chocolatey):'
    Write-Host '  choco install -y python' ; Write-Host '  python -m pip install --user git-filter-repo'
    if($stashed){ Write-Host 'You have a stash; run `git stash pop` after installation if needed.' }
    exit 2
}

# create backup branch
$ts = (Get-Date -Format yyyyMMddHHmmss)
$backup = "backup/purge-before-filter-repo-$ts"
git branch $backup
OutOk "Created backup branch $backup"

# run filter-repo
$args = @('--force','--invert-paths')
foreach($p in $pathsToRemove){ $args += @('--paths', $p) }
Write-Host 'Running git filter-repo (this may take some time)...'
git filter-repo @args
if($LASTEXITCODE -ne 0){ OutErr 'git filter-repo failed'; if($stashed){ git stash pop }; exit 3 }

OutOk 'filter-repo completed'

Write-Host 'Expiring reflog and running git gc...'
git reflog expire --expire=now --all
git gc --prune=now --aggressive

Write-Host 'Force-pushing all branches and tags to origin (requires network access)...'
git push origin --force --all
git push origin --force --tags

if($stashed){ Write-Host 'Restoring previous working tree (stash pop)...'; git stash pop }

OutOk 'Done. IMPORTANT: inform collaborators to reset their clones:'
Write-Host "  git fetch origin && git checkout main && git reset --hard origin/main"
