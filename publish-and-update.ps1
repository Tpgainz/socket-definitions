Write-Host "Building socket-definitions..." -ForegroundColor Green
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Committing any uncommitted changes..." -ForegroundColor Green
git add .
git commit -m "Pre-version bump commit"

Write-Host "Bumping version..." -ForegroundColor Green
npm version patch

if ($LASTEXITCODE -ne 0) {
    Write-Host "Version bump failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Pushing to origin..." -ForegroundColor Green
git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "Push failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Publishing to npm..." -ForegroundColor Green
npm publish

if ($LASTEXITCODE -ne 0) {
    Write-Host "Publish failed!" -ForegroundColor Red
    exit 1
}

$packageJson = Get-Content "package.json" | ConvertFrom-Json
$newVersion = $packageJson.version

Write-Host "Published version $newVersion successfully!" -ForegroundColor Green
Write-Host "Waiting 20 seconds for npm registry to propagate..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

Write-Host "Updating web project..." -ForegroundColor Green
Set-Location "../web"
npm install "@tpgainz/socket-events@$newVersion"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to update web project. Trying with @latest..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    npm install "@tpgainz/socket-events@latest"
}

Write-Host "Updating native project..." -ForegroundColor Green
Set-Location "../native"
npm install "@tpgainz/socket-events@$newVersion"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to update native project. Trying with @latest..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    npm install "@tpgainz/socket-events@latest"
}

Write-Host "Updating socket-server project..." -ForegroundColor Green
Set-Location "../socket-server"
npm install "@tpgainz/socket-events@$newVersion"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to update socket-server project. Trying with @latest..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    npm install "@tpgainz/socket-events@latest"
}

Set-Location "../socket-definitions"
Write-Host "All projects updated successfully!" -ForegroundColor Green