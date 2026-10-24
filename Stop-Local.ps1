$ErrorActionPreference = 'Stop'
Push-Location $PSScriptRoot
try {
    docker compose --env-file .env.local -f compose.local.yml stop
    if ($LASTEXITCODE -ne 0) { throw 'Worklenz shutdown failed.' }
} finally { Pop-Location }
