@echo off
setlocal
cd /d "%~dp0"

if exist "dist-electron\win-unpacked\PlanBoard.exe" (
  start "" "dist-electron\win-unpacked\PlanBoard.exe"
  exit /b 0
)

for %%F in ("dist-electron\PlanBoard *.exe") do (
  if exist %%F (
    start "" %%F
    exit /b 0
  )
)

if exist "dist-electron\win-unpacked\RuneBoard.exe" (
  start "" "dist-electron\win-unpacked\RuneBoard.exe"
  exit /b 0
)

for %%F in ("dist-electron\RuneBoard *.exe") do (
  if exist %%F (
    start "" %%F
    exit /b 0
  )
)

if exist "dist-electron\win-unpacked\DoomPlanner.exe" (
  start "" "dist-electron\win-unpacked\DoomPlanner.exe"
  exit /b 0
)

for %%F in ("dist-electron\DoomPlanner *.exe") do (
  if exist %%F (
    start "" %%F
    exit /b 0
  )
)

echo PlanBoard ne sobran.
echo.
echo V PowerShell vypolnite:
echo   pnpm install
echo   pnpm rebuild electron
echo   pnpm electron:build
echo.
echo Ili dlya razrabotki:
echo   pnpm electron:dev
pause
