@echo off
setlocal
set "ROOT=%~dp0"
if exist "%ROOT%.goddess-fall-server.pid" (
  for /f %%P in (%ROOT%.goddess-fall-server.pid) do taskkill /PID %%P /T /F >nul 2>nul
  del /q "%ROOT%.goddess-fall-server.pid" >nul 2>nul
)
echo 女神之殇服务已关闭。
endlocal
