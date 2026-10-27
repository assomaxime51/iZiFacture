@echo off
cd /d "%~dp0"
start "iZiFacture serveur" /b cmd /c ""C:\Program Files\nodejs\npm.cmd" run dev -- -p 3007"
timeout /t 8 /nobreak >nul
start "" "http://localhost:3007/"
