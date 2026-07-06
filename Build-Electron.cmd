@echo off
setlocal
cd /d "%~dp0"

echo Закройте RuneBoard, если он запущен.
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
echo Готово! Запускайте DoomPlanner.cmd
echo Установщик: dist-electron\RuneBoard Setup *.exe
echo Portable:   dist-electron\RuneBoard *.exe
pause
