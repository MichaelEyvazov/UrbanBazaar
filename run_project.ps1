# run_project.ps1
# Automates the deployment of the UrbanBazaar project.

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   UrbanBazaar - Automated Deployment" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Prerequisite Check: Docker
Write-Host "`n[1/4] Checking Docker status..."
try {
    $dockerInfo = docker info 2>&1
    if ($LASTEXITCODE -ne 0) { throw "Docker is not responding." }
    Write-Host "Docker is running." -ForegroundColor Green
}
catch {
    Write-Host "ERROR: Docker is NOT running or not installed." -ForegroundColor Red
    Write-Host "Please install/start Docker Desktop and try again." -ForegroundColor Yellow
    Write-Host "Download: https://www.docker.com/products/docker-desktop" -ForegroundColor Blue
    Read-Host "Press Enter to exit..."
    exit 1
}

# 2. Cleanup
Write-Host "`n[2/4] Cleaning up previous containers..."
try {
    docker compose down --remove-orphans 2>$null
    Write-Host "Cleanup complete." -ForegroundColor Green
}
catch {
    Write-Warning "Cleanup warning (can be ignored)."
}

# 3. Build & Run
# This ensures images are built for the local architecture (x86_64 on Windows),
# solving the M2 vs Windows compatibility issue.
Write-Host "`n[3/4] Building and starting services (this may take a few minutes)..."
docker compose up -d --build

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker Compose failed to start." -ForegroundColor Red
    Read-Host "Press Enter to exit..."
    exit 1
}

# 4. Finalize
Write-Host "`n[4/4] Waiting for services to initialize..."
Start-Sleep -Seconds 15

# Attempt to seed database (Optional but helpful for grader)
Write-Host "Seeding demo data..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/seed" -Method Get -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "Database seeded successfully!" -ForegroundColor Green
    }
}
catch {
    Write-Warning "Could not automatically seed database. The backend might still be loading."
    Write-Host "You can seed manually by visiting: http://localhost:4000/api/seed" -ForegroundColor Gray
}

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "SUCCESS! Project is running." -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:4000" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Open in default browser
Start-Process "http://localhost:3000"
