# Rewrites commits from $BaseRef..HEAD, removing any "Co-authored-by: Cursor*"
# trailer lines. Run before pushing. Usage:
#   powershell -File scripts/strip-coauthor.ps1 [-BaseRef origin/main]
param([string]$BaseRef = "")

$ErrorActionPreference = "Stop"

# Collect the commits to rewrite, oldest first.
if ($BaseRef -ne "") {
  $shas = @(git rev-list --reverse "$BaseRef..HEAD")
} else {
  $shas = @(git rev-list --reverse HEAD)
}

if ($shas.Count -eq 0) {
  Write-Host "Nothing to rewrite."
  exit 0
}

# Map of old parent sha -> new parent sha as we rebuild the chain.
$map = @{}
$rewritten = 0

foreach ($sha in $shas) {
  $msg = (git log -1 --format='%B' $sha) -join "`n"
  $clean = ($msg -split "`n" | Where-Object { $_ -notmatch '^Co-authored-by: [Cc]ursor' }) -join "`n"
  $clean = $clean.TrimEnd()

  $tree = git rev-parse "$sha^{tree}"
  $parents = @(git rev-list --parents -n 1 $sha) | Select-Object -Skip 1

  $args = @($tree)
  foreach ($p in $parents) {
    $newParent = if ($map.ContainsKey($p)) { $map[$p] } else { $p }
    $args += @("-p", $newParent)
  }

  $env:GIT_AUTHOR_NAME = git log -1 --format='%an' $sha
  $env:GIT_AUTHOR_EMAIL = git log -1 --format='%ae' $sha
  $env:GIT_AUTHOR_DATE = git log -1 --format='%aD' $sha
  $env:GIT_COMMITTER_DATE = git log -1 --format='%cD' $sha

  $newSha = ($clean | & git commit-tree @args).Trim()
  $map[$sha] = $newSha
  if ($clean -ne $msg.TrimEnd()) { $rewritten++ }
}

$head = $map[$shas[-1]]
git reset --hard $head | Out-Null
Write-Host "Rewrote $rewritten commit message(s). HEAD is now $head"
