# Wild West Launchpad - Deployment Script
# Quick deployment to GitHub repository

param(
    [string]$Message = "Update Wild West Launchpad",
    [switch]$Force = $false
)

Write-Host "🚀 Wild West Launchpad - Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check if we're in the right directory
if (-not (Test-Path "index.html") -or -not (Test-Path "js/wallet.js")) {
    Write-Host "❌ Error: Must run from Wild West Launchpad root directory" -ForegroundColor Red
    exit 1
}

# Show current status
Write-Host "📊 Checking Git status..." -ForegroundColor Yellow
git status --porcelain

# Add all changes
Write-Host "📝 Adding changes..." -ForegroundColor Yellow
git add .

# Check if there are changes to commit
$changes = git diff --staged --name-only
if (-not $changes -and -not $Force) {
    Write-Host "✅ No changes detected. Use -Force to push anyway." -ForegroundColor Green
    exit 0
}

# Commit changes
Write-Host "💾 Committing changes..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$fullMessage = "$Message - $timestamp"
git commit -m "$fullMessage"

# Push to GitHub
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Yellow
try {
    git push origin main
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host "🌐 Your site will be live at: https://cowboytbc.github.io/wildwest-launchpad/" -ForegroundColor Green
    Write-Host "⏱️ GitHub Pages typically takes 1-2 minutes to update" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Push failed. You may need to create the GitHub repository first." -ForegroundColor Red
    Write-Host "📝 Create it at: https://github.com/new" -ForegroundColor Yellow
    Write-Host "📝 Repository name: wildwest-launchpad" -ForegroundColor Yellow
    Write-Host "📝 Owner: cowboytbc" -ForegroundColor Yellow
}

Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Create GitHub repository if not exists: https://github.com/new" -ForegroundColor White
Write-Host "2. Add required secrets in: Settings → Secrets and variables → Actions" -ForegroundColor White
Write-Host "3. Enable GitHub Pages in: Settings → Pages" -ForegroundColor White
Write-Host "4. Required secrets:" -ForegroundColor White
Write-Host "   - GITHUB_TOKEN" -ForegroundColor Gray
Write-Host "   - SOLANA_RPC_ENDPOINT" -ForegroundColor Gray
Write-Host "   - BASE_RPC_ENDPOINT" -ForegroundColor Gray
