$destDir = Join-Path $PSScriptRoot "..\figma-plugin\libs"
if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
}

$url = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.7.1/jszip.min.js'
$out = Join-Path $destDir 'jszip.min.js'

Write-Output "Downloading JSZip from $url"
try {
    Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing -ErrorAction Stop
    Write-Output "Saved to $out"
} catch {
    Write-Error "Failed to download JSZip: $_"
    exit 1
}

Write-Output "Bundle complete. You can now use the plugin offline."