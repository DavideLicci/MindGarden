$pluginDir = Join-Path $PSScriptRoot "..\figma-plugin"
$outDir = Join-Path $PSScriptRoot "..\dist"
if (-not (Test-Path $pluginDir)) {
    Write-Error "Plugin folder not found: $pluginDir"
    exit 2
}
if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$outFile = Join-Path $outDir "mindgarden-figma-plugin-$timestamp.zip"

Write-Output "Packaging plugin from $pluginDir -> $outFile"

# Exclude common dev files if present

$temp = Join-Path $env:TEMP "mg_figma_plugin_pack_$timestamp"
if (Test-Path $temp) { Remove-Item -Recurse -Force $temp }
New-Item -ItemType Directory -Path $temp | Out-Null

# Copy plugin folder contents to temp, excluding heavy or dev-only folders
Write-Output "Copying files to temp folder..."
Copy-Item -Path (Join-Path $pluginDir '*') -Destination $temp -Recurse -Force -ErrorAction Stop
# Remove node_modules if present
$nm = Join-Path $temp 'node_modules'
if (Test-Path $nm) { Remove-Item -Recurse -Force $nm }

Compress-Archive -Path (Join-Path $temp '*') -DestinationPath $outFile -Force

# cleanup
Remove-Item -Recurse -Force $temp

Write-Output "Plugin packaged: $outFile"
Write-Output "You can upload this ZIP to Figma Community (as a plugin) or distribute manually." 