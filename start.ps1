# Setup and Start Backend (Using SQLite)
Write-Host "Starting NestJS Backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit -Command `"cd backend; npm run start:dev`""

# Setup and Start Admin Web
Write-Host "Starting Next.js Admin Portal..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit -Command `"cd admin-web; npm run dev`""

Write-Host "All services started! (Using SQLite natively without Docker)." -ForegroundColor Green
Write-Host "To run the mobile app, navigate to 'mobile', run 'flutter pub get' and 'flutter run'" -ForegroundColor Yellow
