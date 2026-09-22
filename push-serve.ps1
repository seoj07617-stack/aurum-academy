# 推送修复版 serve.ps1 到远端仓库（防止其他会话再次用旧版覆盖本地）
$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$token = (Get-Content (Join-Path $root ".token") -Raw).Trim()
$h = @{ Authorization = "token " + $token; "User-Agent" = "z"; Accept = "application/vnd.github+json" }
$api = "https://api.github.com/repos/seoj07617-stack/aurum-academy/contents/serve.ps1"
$sha = $null
try { $cur = Invoke-RestMethod -Headers $h -Uri ($api + "?ref=main"); $sha = $cur.sha } catch {}
$content = [Convert]::ToBase64String([IO.File]::ReadAllBytes((Join-Path $root "serve.ps1")))
$body = @{ message = "fix: LAN-mode serve.ps1 (TcpListener, UTF-8 BOM)"; content = $content; branch = "main" }
if ($sha) { $body.sha = $sha }
Invoke-RestMethod -Method Put -Headers $h -Uri $api -Body ($body | ConvertTo-Json) -ContentType "application/json" | Out-Null
Write-Host "serve.ps1 pushed to remote"
