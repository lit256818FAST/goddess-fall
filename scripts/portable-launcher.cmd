@echo off
setlocal
set "ROOT=%~dp0"
start "" powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%ROOT%portable-server.ps1" -Root "%ROOT%"
echo 女神之殇正在启动，请稍候……
timeout /t 2 /nobreak >nul
endlocal
