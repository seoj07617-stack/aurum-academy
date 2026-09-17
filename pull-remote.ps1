# 从 GitHub 远端拉取仓库全部文件到本地（字节级精确，本地先备份）
$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backup = Join-Path $root ("..\aurum-academy-backup-" + (Get-Date -Format "MMdd-HHmm"))
New-Item -ItemType Directory -Path $backup -Force | Out-Null
Copy-Item -Path (Join-Path $root "*") -Destination $backup -Recurse -Force
Remove-Item (Join-Path $backup ".token") -Force -ErrorAction SilentlyContinue
Write-Host ("backup -> " + (Resolve-Path $backup).Path)

$token = (Get-Content (Join-Path $root ".token") -Raw).Trim()
$owner = "seoj07617-stack"; $repo = "aurum-academy"
$headers = @{ Authorization = "token " + $token; "User-Agent" = "z"; Accept = "application/vnd.github+json" }

$tree = Invoke-RestMethod -Headers $headers -Uri ("https://api.github.com/repos/$owner/$repo/git/trees/main?recursive=1")
$files = $tree.tree | Where-Object { $_.type -eq "blob" }
Write-Host ("remote files: " + $files.Count)

$wc = New-Object System.Net.WebClient
$wc.Headers.Add("Authorization", "token " + $token)
$wc.Headers.Add("User-Agent", "z")
$ok = 0
foreach ($f in $files) {
  $local = Join-Path $root ($f.path.Replace("/", "\"))
  $dir = Split-Path -Parent $local
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
  $bytes = $wc.DownloadData("https://raw.githubusercontent.com/$owner/$repo/main/" + $f.path)
  [IO.File]::WriteAllBytes($local, $bytes)
  $ok++
}
$wc.Dispose()
Write-Host ("synced: " + $ok + " files from remote -> local (byte-exact)")
