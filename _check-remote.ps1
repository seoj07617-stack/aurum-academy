$ErrorActionPreference='Stop'
$tok=(Get-Content (Join-Path $PSScriptRoot '.token') -Raw).Trim().Trim('"')
$h=@{Authorization="token $tok"; 'User-Agent'='aurum-check'}
$r=Invoke-RestMethod -Uri 'https://api.github.com/repos/seoj07617-stack/aurum-academy/commits?per_page=15' -Headers $h
foreach($c in $r){ '{0}  {1}  {2}' -f $c.sha.Substring(0,7), $c.commit.author.date, (($c.commit.message -split "`n")[0]) }
