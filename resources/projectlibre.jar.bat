@echo off
echo Started ProjectLibreApplication
echo Mock Java backend started on port %1
:loop
timeout /t 1 /nobreak >nul
goto loop
