# 知行金融学院 本地预览服务（零依赖，纯 PowerShell）
# 用法：右键本文件 -> 使用 PowerShell 运行；或命令行执行 .\serve.ps1
# 打开 http://localhost:8080/  即可本地学习（Ctrl+C 关闭）
$port = 8080
$root = $PSScriptRoot
$types = @{
  ".html" = "text/html; charset=utf-8"; ".js" = "text/javascript; charset=utf-8"
  ".css" = "text/css; charset=utf-8"; ".json" = "application/json; charset=utf-8"
  ".webmanifest" = "application/manifest+json; charset=utf-8"; ".png" = "image/png"
  ".jpg" = "image/jpeg"; ".svg" = "image/svg+xml"; ".ico" = "image/x-icon"
  ".woff2" = "font/woff2"; ".woff" = "font/woff"
}
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "知行金融学院已开讲: http://localhost:$port/  (Ctrl+C 关闭)"
try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $path = $ctx.Request.Url.AbsolutePath
    if ($path -eq "/") { $path = "/index.html" }
    $file = Join-Path $root ($path -replace "/", "\")
    if ((Test-Path $file -PathType Leaf) -and ((Resolve-Path $file).Path.StartsWith($root))) {
      $ext = [System.IO.Path]::GetExtension($file).ToLower()
      $mime = if ($types.ContainsKey($ext)) { $types[$ext] } else { "application/octet-stream" }
      $bytes = [System.IO.File]::ReadAllBytes($file)
      $ctx.Response.ContentType = $mime
      $ctx.Response.ContentLength64 = $bytes.Length
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $ctx.Response.StatusCode = 404
      $err = [System.Text.Encoding]::UTF8.GetBytes("404 - 未找到该页")
      $ctx.Response.OutputStream.Write($err, 0, $err.Length)
    }
    $ctx.Response.OutputStream.Close()
  }
} finally { $listener.Stop() }
