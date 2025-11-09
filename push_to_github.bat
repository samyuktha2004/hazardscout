@echo off
echo Starting Git setup and push to GitHub...
echo.

cd /d "c:\IMOBILITHON 5.0\src"
echo Current directory: %CD%

echo.
echo Initializing git repository...
git init

echo.
echo Adding GitHub remote...
git remote add origin https://github.com/samyuktha2004/hazardscout.git

echo.
echo Configuring git user...
git config user.email "samyuktha2004@gmail.com"
git config user.name "samyuktha2004"

echo.
echo Adding all files...
git add .

echo.
echo Making initial commit...
git commit -m "Initial commit: Hazard Scout React app with VW integration - Complete road safety application with real-time hazard detection, community verification, and live navigation"

echo.
echo Setting main branch...
git branch -M main

echo.
echo Pushing to GitHub...
git push -u origin main

echo.
echo Git operations completed!
echo Repository URL: https://github.com/samyuktha2004/hazardscout
echo.
pause
