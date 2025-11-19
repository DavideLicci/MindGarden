Param(
    [string]$MsysRoot = "C:\msys64",
    [switch]$NoRun
)

$ErrorActionPreference = 'Stop'

$mingwBin = Join-Path $MsysRoot "mingw64\bin"
Write-Host "MSYS root: $MsysRoot"

$modified = $false
$oldPath = $env:Path
if (Test-Path $mingwBin) {
    Write-Host "Found mingw bin: $mingwBin"
    $env:Path = "$mingwBin;$env:Path"
    $modified = $true
    Write-Host "Prepended $mingwBin to PATH for this PowerShell session."
} else {
    Write-Warning "mingw64 bin not found at $mingwBin. Continuing without modifying PATH."
}

$venvPython = Join-Path -Path (Get-Location) -ChildPath ".\.venv\Scripts\python.exe"
if (Test-Path $venvPython) {
    $pythonExe = $venvPython
} else {
    Write-Warning "Virtualenv python not found at $venvPython. Falling back to 'python' in PATH."
    $pythonExe = "python"
}

$scriptPath = Join-Path -Path (Get-Location) -ChildPath ".\scripts\export_wireframes_png.py"

Write-Host "Command to run: $pythonExe $scriptPath"

if ($NoRun) {
    Write-Host "Dry-run (-NoRun) mode: not executing exporter."
    if ($modified) { $env:Path = $oldPath }
    exit 0
}

$exitCode = 0
try {
    & $pythonExe $scriptPath
    $exitCode = $LASTEXITCODE
} catch {
    Write-Error "Exporter failed: $($_.Exception.Message)"
    $exitCode = 1
} finally {
    if ($modified) {
        $env:Path = $oldPath
        Write-Host "Restored original PATH."
    }
}

# Propagate the child exit code
exit $exitCode
