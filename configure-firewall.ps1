# PowerShell script to configure Windows Firewall for Bug Tracker API
# Run this as Administrator

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Bug Tracker - Firewall Configuration" -ForegroundColor Cyan  
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host ""
    Write-Host "To run as Administrator:" -ForegroundColor Yellow
    Write-Host "1. Right-click on PowerShell" -ForegroundColor Yellow
    Write-Host "2. Select 'Run as Administrator'" -ForegroundColor Yellow
    Write-Host "3. Navigate to: cd $PWD" -ForegroundColor Yellow
    Write-Host "4. Run: .\configure-firewall.ps1" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

Write-Host "[1/3] Checking existing firewall rules..." -ForegroundColor Yellow

# Check if rule already exists
$existingRule = Get-NetFirewallRule -DisplayName "Bug Tracker API" -ErrorAction SilentlyContinue

if ($existingRule) {
    Write-Host "  Found existing rule. Removing..." -ForegroundColor Cyan
    Remove-NetFirewallRule -DisplayName "Bug Tracker API"
}

Write-Host "[2/3] Creating new firewall rule..." -ForegroundColor Yellow

# Create new inbound rule for port 5000
try {
    New-NetFirewallRule `
        -DisplayName "Bug Tracker API" `
        -Direction Inbound `
        -Protocol TCP `
        -LocalPort 5000 `
        -Action Allow `
        -Profile Any `
        -Description "Allows incoming connections to Bug Tracker backend API on port 5000"
    
    Write-Host "  SUCCESS: Firewall rule created!" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: Failed to create firewall rule" -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "[3/3] Verifying firewall rule..." -ForegroundColor Yellow

$newRule = Get-NetFirewallRule -DisplayName "Bug Tracker API" -ErrorAction SilentlyContinue

if ($newRule) {
    Write-Host "  SUCCESS: Firewall rule verified!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Firewall Rule Details:" -ForegroundColor Cyan
    Write-Host "  Name: Bug Tracker API" -ForegroundColor White
    Write-Host "  Port: 5000 (TCP)" -ForegroundColor White
    Write-Host "  Direction: Inbound" -ForegroundColor White
    Write-Host "  Action: Allow" -ForegroundColor White
    Write-Host "  Profiles: Domain, Private, Public" -ForegroundColor White
} else {
    Write-Host "  WARNING: Could not verify firewall rule" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Firewall Configuration Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Restart your server: cd server; npm start" -ForegroundColor White
Write-Host "2. Test connectivity: npm run test-network" -ForegroundColor White
Write-Host "3. Connect your phone to the same WiFi network" -ForegroundColor White
Write-Host "4. Test from phone browser: http://10.113.191.115:5000/api/health" -ForegroundColor White
Write-Host ""
pause
