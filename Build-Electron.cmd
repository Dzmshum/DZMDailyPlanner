@echo off
setlocal
cd /d "%~dp0"

echo Закройте PlanBoard, если он запущен.
echo.

if exist "dist-electron" (
  rmdir /s /q "dist-electron" 2>nul
)

powershell -NoProfile -ExecutionPolicy Bypass -Command "pnpm electron:build"
if errorlevel 1 (
  echo.
  echo Сборка не удалась.
  pause
  exit /b 1
)
echo.
echo Готово! Запускайте PlanBoard.cmd
echo Установщик: dist-electron\PlanBoard Setup *.exe
echo Portable:   dist-electron\PlanBoard *.exe
pause
