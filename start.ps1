Write-Host "Starting Peer Evaluation System..." -ForegroundColor Green
Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm run setup
Write-Host ""
Write-Host "Starting both frontend and backend servers..." -ForegroundColor Green
npm run dev