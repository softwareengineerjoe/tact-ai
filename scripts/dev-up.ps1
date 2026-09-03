# Starts local PostgreSQL 17 + the TACT AI backend (detached) for local development.
# Usage:  pwsh -File scripts/dev-up.ps1
# Then start the frontend separately:  cd apps/web; pnpm dev

$ErrorActionPreference = 'Stop'

$pgBin = 'C:\Program Files\PostgreSQL\17\bin'
$pgData = "$env:USERPROFILE\tact-pgdata"
$repo = Split-Path -Parent $PSScriptRoot
$api = Join-Path $repo 'apps\api'
$py = Join-Path $api '.venv\Scripts\python.exe'
$dbUrl = 'postgresql+asyncpg://tact:tact_local_password@localhost:5432/tact'

# 1. Start PostgreSQL if it is not already listening on 5432.
if (-not (Get-NetTCPConnection -LocalPort 5432 -State Listen -ErrorAction SilentlyContinue)) {
    & "$pgBin\pg_ctl.exe" -D $pgData -l "$pgData\server.log" -o '-p 5432' start
    Start-Sleep 2
    Write-Host 'PostgreSQL: started' -ForegroundColor Green
}
else {
    Write-Host 'PostgreSQL: already running' -ForegroundColor Yellow
}

# 2. Start the backend (detached) if it is not already listening on 8000.
if (-not (Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue)) {
    $env:DATABASE_URL = $dbUrl
    Start-Process -FilePath $py `
        -ArgumentList '-m', 'uvicorn', 'app.main:create_app', '--factory', '--host', '127.0.0.1', '--port', '8000', '--app-dir', $api `
        -WorkingDirectory $api `
        -RedirectStandardOutput "$api\server.out.log" `
        -RedirectStandardError  "$api\server.err.log" `
        -WindowStyle Hidden
    Start-Sleep 3
    Write-Host 'Backend: started on http://127.0.0.1:8000' -ForegroundColor Green
}
else {
    Write-Host 'Backend: already running' -ForegroundColor Yellow
}

# 3. Health check.
try {
    $health = (Invoke-RestMethod http://127.0.0.1:8000/health/live).status
    Write-Host "Health: $health" -ForegroundColor Green
}
catch {
    Write-Host "Health check failed. See $api\server.err.log" -ForegroundColor Red
}
