@echo off
echo 🚀 Wild West Launchpad - Quick Deploy
echo ====================================

REM Check if PowerShell is available
powershell.exe -Command "& {Write-Host 'PowerShell available' -ForegroundColor Green}"
if %errorlevel% neq 0 (
    echo ❌ PowerShell not available. Using basic Git commands...
    goto BASICDEPLOY
)

REM Run PowerShell deployment script
powershell.exe -ExecutionPolicy Bypass -File "deploy.ps1" %*
goto END

:BASICDEPLOY
echo 📝 Adding changes...
git add .

echo 💾 Committing changes...
set timestamp=%date% %time%
git commit -m "Update Wild West Launchpad - %timestamp%"

echo 🚀 Pushing to GitHub...
git push origin main

if %errorlevel% equ 0 (
    echo ✅ Deployment successful!
    echo 🌐 Live at: https://cowboytbc.github.io/wildwest-launchpad/
) else (
    echo ❌ Push failed. Create GitHub repository first.
    echo 📝 Create at: https://github.com/new
)

:END
pause
