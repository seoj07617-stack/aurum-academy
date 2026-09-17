# 排查表情符号/特殊字符是否在提交链路中损坏
$ErrorActionPreference = "SilentlyContinue"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$files = @("js\views\lesson.js","js\views\daily.js","index.html","js\views\quiz.js","js\views\map.js","js\data\capstone.js")
foreach ($f in $files) {
  $p = Join-Path $root $f
  $c = [IO.File]::ReadAllText($p, [Text.Encoding]::UTF8)
  $replacement = [regex]::Matches($c, [string][char]0xFFFD).Count
  $warn = $c.Contains([string][char]0x26A0)          # ⚠
  $spark = $c.Contains([string][char]0x2728)          # ✨
  $questionTag = $c.Contains("? 常见误区")
  $plain = $c.Contains("plain-box")
  Write-Host ("{0}  乱码:{1}  ⚠:{2}  ✨:{3}  ?误区:{4}  plain-box:{5}" -f $f, $replacement, $warn, $spark, $questionTag, $plain)
}
