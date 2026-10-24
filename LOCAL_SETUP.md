# Worklenz local

Clone independente em `C:\Worklenz`, com histórico e branch Git próprios.
Código de origem: https://github.com/Worklenz/worklenz (base `697aec19`).
A configuração local está na branch `codex/local-setup`.

## Executar

Requisitos: Docker Desktop com Linux containers, Node.js 22 ou superior e PowerShell.

```powershell
cd C:\Worklenz
.\Start-Local.ps1
```

- Aplicativo: http://localhost:8082
- Portal do cliente: http://localhost:8083
- Caixa de e-mail local: http://localhost:8085
- PostgreSQL exclusivo: localhost:5548
- Armazenamento S3 local: http://localhost:8334

Crie a sua conta pelo cadastro do aplicativo. Mensagens de teste ficam no Mailpit.
As imagens da interface, API e portal são compiladas a partir deste clone.

## Parar e reconstruir

`Stop-Local.ps1` para somente os serviços deste projeto e preserva os volumes.
Depois de mudar código, execute novamente `Start-Local.ps1` para reconstruir.
Para conferir o ambiente:

```powershell
docker compose --env-file .env.local -f compose.local.yml ps
docker compose --env-file .env.local -f compose.local.yml logs --tail 80
```

O projeto Docker é `worklenz-local`. Banco, arquivos e mensagens usam volumes próprios.
A configuração privada é gerada em `.env.local`, ignorada pelo Git, e não deve ser versionada.
Para consultar credenciais do banco, abra esse arquivo localmente.

## Git

Este clone tem um `.git` próprio e não pertence ao repositório do Kanban.
O remoto `origin` aponta para https://github.com/zaygron/worklenz.git (seu fork).
O remoto `upstream` aponta para https://github.com/Worklenz/worklenz.git (projeto oficial).
O destino padrão dos pushes é `origin`. A branch local é `codex/local-setup`.
A licença original AGPL-3.0 permanece em `LICENSE`.

## Ajustes necessários nesta revisão

- O serviço de migração monta `pg-migrations` e `pg-migrations-support` do clone. O Dockerfile original não inclui o auxiliar `team-lead-prerequisites.js` na imagem.
- A migração `1791454074122` foi ajustada para preservar a tabela antiga de leituras em `client_portal_notification_reads_legacy` antes de criar a estrutura por contato usada pelo portal atual. A reversão restaura o nome antigo.

Os ajustes de instalação são versionados na branch `codex/local-setup` do fork `zaygron/worklenz`. O arquivo privado `.env.local` permanece fora do Git.

A regressão da migração é coberta por `worklenz-backend/src/tests/client-portal-client-app-state-migration.spec.ts`. Para executá-la, defina `TEST_CLIENT_PORTAL_DATABASE_URL` apontando para um banco descartável e execute `npm test -- --runInBand --coverage=false client-portal-client-app-state-migration` no backend. O teste preserva leituras antigas e verifica upgrade, repetição e reversão.
