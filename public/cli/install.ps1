# KRONVEX Official CLI Installer for Windows (PowerShell)
# Usage: irm https://kronvex.org/cli/install.ps1 | iex

$ErrorActionPreference = "Stop"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "[ERROR] Node.js >= 18 is required. Install from https://nodejs.org/" -ForegroundColor Red
  exit 1
}

$InstallDir = Join-Path $env:USERPROFILE ".kronvex\bin"
New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null

$CliScript = Join-Path $InstallDir "kronvex.mjs"
Write-Host "Downloading KRONVEX CLI v1.1.0 from https://kronvex.org/cli/kronvex.mjs ..." -ForegroundColor Cyan
Invoke-WebRequest -Uri "https://kronvex.org/cli/kronvex.mjs" -OutFile $CliScript -UseBasicParsing

# Create Windows .cmd wrappers for both `kronvex` and `kvx`
$Wrapper = "@echo off`r`nnode `"%~dp0kronvex.mjs`" %*`r`n"
Set-Content -Path (Join-Path $InstallDir "kronvex.cmd") -Value $Wrapper -Encoding ASCII
Set-Content -Path (Join-Path $InstallDir "kvx.cmd") -Value $Wrapper -Encoding ASCII

# Add to user PATH if missing
$UserPath = [Environment]::GetEnvironmentVariable("Path", "User")
if (-not $UserPath) { $UserPath = "" }
if ($UserPath.Split(";") -notcontains $InstallDir) {
  $NewPath = if ($UserPath.TrimEnd(";") -eq "") { $InstallDir } else { "$($UserPath.TrimEnd(';'));$InstallDir" }
  [Environment]::SetEnvironmentVariable("Path", $NewPath, "User")
  $env:Path = "$env:Path;$InstallDir"
  Write-Host "Added $InstallDir to your User PATH." -ForegroundColor Green
}

$Hash = (Get-FileHash -Path $CliScript -Algorithm SHA256).Hash.ToLower()
Write-Host ""
Write-Host "[OK] KRONVEX CLI installed successfully!" -ForegroundColor Green
Write-Host "     SHA-256 : $Hash" -ForegroundColor DarkGray
Write-Host "     Commands: kronvex | kvx" -ForegroundColor White
Write-Host "     Try now : kronvex doctor" -ForegroundColor Cyan
