$ErrorActionPreference = "Stop"

$adminEmail = "admin@e2e.test.com"
$adminPassword = "TestPass123!"
$testApiUrl = "http://localhost:3100"
$mobileDir = Join-Path $PSScriptRoot "..\mobile"

Write-Host "=== Step 1: Starting test infrastructure ==="
docker compose -f (Join-Path $PSScriptRoot "..\docker-compose.test.yml") up -d
Write-Host "Waiting for services to be ready..."
Start-Sleep -Seconds 10

Write-Host "=== Step 2: Verifying API health ==="
$maxRetries = 12
for ($i = 0; $i -lt $maxRetries; $i++) {
  try {
    $health = Invoke-RestMethod -Uri "$testApiUrl/api/health" -ErrorAction Stop
    if ($health.success -or $health.status -eq "ok") {
      Write-Host "API is healthy!"
      break
    }
  } catch {
    Write-Host "Waiting for API... attempt $($i+1)/$maxRetries"
  }
  Start-Sleep -Seconds 5
}

Write-Host "=== Step 3: Registering admin user ==="
$registerBody = @{
  email = $adminEmail
  password = $adminPassword
  name = "E2E Admin"
} | ConvertTo-Json

try {
  $registerResponse = Invoke-RestMethod -Method Post -Uri "$testApiUrl/api/auth/register" -Body $registerBody -ContentType "application/json" -ErrorAction Stop
  Write-Host "Admin user registered"
} catch {
  Write-Host "Admin user may already exist (expected on re-runs). Proceeding..."
}

Write-Host "=== Step 4: Promoting to ADMIN role ==="
$sqlResult = docker exec cityhub-postgres-test psql -U postgres -d civic_test -c "UPDATE users SET role='ADMIN' WHERE email='$adminEmail'"
Write-Host "Promotion result: $sqlResult"

Write-Host "=== Step 5: Verifying admin role ==="
docker exec cityhub-postgres-test psql -U postgres -d civic_test -c "SELECT email, role FROM users WHERE email='$adminEmail'"

Write-Host "=== Step 6: Running Flutter integration tests ==="
Set-Location -LiteralPath $mobileDir

$env:ANDROID_HOME = ""
$env:ANDROID_SDK_ROOT = ""

flutter test integration_test/ `
  --dart-define=API_BASE_URL=http://localhost:3100 `
  --dart-define=SOCKET_URL=http://localhost:3101 `
  --dart-define=TEST_API_URL=http://localhost:3100

$testExitCode = $LASTEXITCODE
Set-Location -LiteralPath $PSScriptRoot

Write-Host "=== Step 7: Cleaning up test infrastructure ==="
docker compose -f (Join-Path $PSScriptRoot "..\docker-compose.test.yml") down

if ($testExitCode -ne 0) {
  Write-Host "FAILURE: Integration tests exited with code $testExitCode"
  exit $testExitCode
}

Write-Host "SUCCESS: All integration tests passed!"
