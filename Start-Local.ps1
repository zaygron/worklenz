$ErrorActionPreference = 'Stop'
Push-Location $PSScriptRoot
try {
    node .\local\setup-env.cjs
    if ($LASTEXITCODE -ne 0) { throw 'Local configuration failed.' }
    docker compose --env-file .env.local -f compose.local.yml build backend frontend client-portal
    if ($LASTEXITCODE -ne 0) { throw 'Worklenz build failed.' }
    docker compose --env-file .env.local -f compose.local.yml up -d --no-build
    if ($LASTEXITCODE -ne 0) { throw 'Worklenz startup failed.' }
    Write-Output 'Worklenz: http://localhost:8082'
    Write-Output 'Client portal: http://localhost:8083'
    Write-Output 'Local email: http://localhost:8085'
} finally { Pop-Location }
