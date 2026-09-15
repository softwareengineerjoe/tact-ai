# Operations

**Status:** Companion document. Derived from [MASTER.md](MASTER.md).

The single source of truth is [MASTER.md](MASTER.md). When anything here conflicts
with the master, the master wins unless an approved ADR changes it.

## Technology Stack

See MASTER section 18 (frontend, backend, data/storage, AI, auth/security,
Azure hosting). Versions must be pinned in the repository.

## Architecture

See MASTER section 17 for the component diagram.

## Non-Functional Requirements

See MASTER section 29:

* Performance targets (API p95 < 500 ms, dashboard < 2 s, AI first response < 5 s).
* Reliability (integration failures must not disable native features; idempotent webhooks; automated, tested backups).
* Observability (API errors, latency, DB, AI/token usage, tool-call failures, integration health, job status).
* Scalability (100–1,000 users, 10–100 active projects, 10,000+ tickets).

## Release Phases

See MASTER section 30 (Phase 0 → Phase 4) and the development order in section 34.

## Quality Checks

Frontend: `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm playwright test`.
Backend: `ruff check .`, `ruff format --check .`, `mypy app`, `pytest`.
See MASTER section 33 for pull-request requirements.

## Coding Standards

All code must follow the binding coding standards:

* Frontend: [FRONTEND_STANDARDS.md](FRONTEND_STANDARDS.md)
* Backend: [BACKEND_STANDARDS.md](BACKEND_STANDARDS.md)

These define the mandatory folder structure, naming, and copy-ready templates
for every component, page, hook, store, service, route, model, schema,
repository, and endpoint. The coding agent enforces them via
[.github/copilot-instructions.md](../.github/copilot-instructions.md).

## Deployment & CI/CD (Phase 1 dev environment)

Everything runs in the single Azure resource group `tact-ai`
(subscription `e103a481-940b-4fe2-bd12-dd92792da17e`, Accenture tenant
`e0793d39-0939-496d-b129-198edd916feb`).

| Layer         | Hosting                                   | Notes                                                |
| ------------- | ----------------------------------------- | ---------------------------------------------------- |
| Web client    | Azure Static Web Apps (`tactai-web`)      | SPA at `delightful-bush-09d54d900.3.azurestaticapps.net` |
| Backend API   | Azure Container Apps (`tactai-api`)       | `tactai-api.kindmoss-f3208b8d.southeastasia.azurecontainerapps.io`, region Southeast Asia |
| Registry      | ACR (`tactaiacr`)                         | Images built in ACR (no local Docker)                |
| Database      | Azure Database for PostgreSQL 17 Flexible | Same resource group                                  |
| AI model      | Microsoft Foundry (`tact-foundry`)        | Endpoint + key passed as Container App secrets       |

### Automated pipeline

`.github/workflows/deploy.yml` deploys on every push to `main` (and manual
`workflow_dispatch`). `dorny/paths-filter` runs the **backend** job only when
`apps/api/**` changes and the **frontend** job only when `apps/web/**` changes.

* **Backend:** `az acr build` builds the image in ACR, then
  `az containerapp update` rolls out a new revision.
* **Frontend:** `pnpm build` then `Azure/static-web-apps-deploy` uploads
  `apps/web/dist`.

### Authentication (how CI signs in to Azure)

* The backend job uses **GitHub OIDC** — no stored client secret. A
  **user-assigned managed identity** `tactai-gh-oidc`
  (client id `366959d4-4fb4-4ea3-ba49-3a7041e691e8`) has **Contributor** on the
  resource group and a **federated credential** whose subject matches the token
  GitHub actually presents:
  `repo:softwareengineerjoe@113113188/tact-ai@1355657840:ref:refs/heads/main`.
  Note this org uses **numeric IDs** in the OIDC subject, not the
  `repo:owner/name:...` name form — the name-based subject does **not** match.
* Creating a classic service principal (`az ad sp create-for-rbac`) is **blocked**
  in this tenant (insufficient directory privileges), which is why the managed
  identity + OIDC approach is used.
* The frontend job uses the SWA deployment token (secret
  `AZURE_STATIC_WEB_APPS_API_TOKEN`), not Azure AD login.

GitHub repository secrets: `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`,
`AZURE_SUBSCRIPTION_ID` (backend OIDC) and `AZURE_STATIC_WEB_APPS_API_TOKEN`
(frontend). The `workflow` `permissions` block sets `id-token: write` for OIDC.

### Gotchas / lessons learned

* **SPA deep-link 404s:** `staticwebapp.config.json` must live in
  `apps/web/public/` so Vite copies it into `dist/`; the config's
  `navigationFallback` rewrites unknown routes to `/index.html`. A copy at the
  `apps/web/` root is **not** deployed.
* **Backend health endpoints** are `/health/live` and `/health/ready`. There is
  **no** bare `/health` route — hitting `/health` correctly returns
  `{"detail":"Not Found"}`.

A Bicep infrastructure-as-code definition is still planned; the current
environment is provisioned by [scripts/deploy-azure.ps1](../scripts/deploy-azure.ps1).
