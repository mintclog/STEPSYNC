@echo off
setlocal
title STEPSYNC Development Server
cd /d "%~dp0"

set "CODEX_RUNTIME=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies"
set "BUNDLED_NODE_DIR=%CODEX_RUNTIME%\node\bin"
set "BUNDLED_PNPM=%CODEX_RUNTIME%\bin\fallback\pnpm.cmd"

if exist "%BUNDLED_NODE_DIR%\node.exe" set "PATH=%BUNDLED_NODE_DIR%;%PATH%"

where node >nul 2>&1
if errorlevel 1 (
  echo [STEPSYNC] Node.js was not found.
  echo Install Node.js or run this project from Codex again.
  pause
  exit /b 1
)

set "PNPM_CMD="
if exist "%BUNDLED_PNPM%" set "PNPM_CMD=%BUNDLED_PNPM%"
if not defined PNPM_CMD (
  where pnpm >nul 2>&1
  if not errorlevel 1 set "PNPM_CMD=pnpm"
)

if not defined PNPM_CMD (
  echo [STEPSYNC] pnpm was not found.
  echo Install pnpm and run this file again.
  pause
  exit /b 1
)

if not exist "node_modules\next\dist\bin\next" (
  echo [STEPSYNC] Installing dependencies for the first run...
  call "%PNPM_CMD%" install
  if errorlevel 1 (
    echo [STEPSYNC] Dependency installation failed.
    pause
    exit /b 1
  )
)

powershell.exe -NoProfile -Command "try { $response = Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost:3000' -TimeoutSec 1; if ($response.Content -match 'STEPSYNC') { exit 0 } } catch {}; exit 1" >nul 2>&1
if not errorlevel 1 (
  echo [STEPSYNC] The server is already running at http://localhost:3000
  if /i not "%STEPSYNC_SKIP_BROWSER%"=="1" start "" http://localhost:3000
  endlocal & exit /b 0
)

echo [STEPSYNC] Starting http://localhost:3000
echo [STEPSYNC] Close this window or press Ctrl+C to stop the server.
echo.

if /i not "%STEPSYNC_SKIP_BROWSER%"=="1" (
  start "" /b powershell.exe -NoProfile -WindowStyle Hidden -Command ^
    "$url = 'http://localhost:3000'; for ($attempt = 0; $attempt -lt 120; $attempt++) { try { $null = Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 1; Start-Process $url; exit } catch { Start-Sleep -Milliseconds 500 } }"
)

call "%PNPM_CMD%" dev

set "SERVER_EXIT_CODE=%ERRORLEVEL%"
if not "%SERVER_EXIT_CODE%"=="0" (
  echo.
  echo [STEPSYNC] Server stopped with exit code %SERVER_EXIT_CODE%.
  pause
)

endlocal & exit /b %SERVER_EXIT_CODE%
