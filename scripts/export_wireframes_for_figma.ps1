$source = Join-Path $PSScriptRoot "..\design\wireframes"
$target = Join-Path $PSScriptRoot "..\wireframes_figma.zip"

if (-Not (Test-Path $source)) {
    Write-Error "Source folder not found: $source"
    exit 2
}

if (Test-Path $target) {
    Remove-Item $target -Force
}

Compress-Archive -Path (Join-Path $source '*') -DestinationPath $target -Force
Write-Output "Created zip: $target"
