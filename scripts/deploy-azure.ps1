<#
.SYNOPSIS
    Deploys the TACT AI backend (Azure Container Apps) and frontend (Azure
    Static Web Apps) into the existing `tact-ai` resource group.

.DESCRIPTION
    Option A (CLI-first) dev deployment per MASTER section 30 Phase 1. Builds the
    backend image in Azure Container Registry (no local Docker needed), stands up
    a PostgreSQL 17 Flexible Server, deploys the API to Container Apps, then builds
    and deploys the React app to Static Web Apps. Re-runnable: existing resources
    are reused. Secrets are passed as Container App secrets, never committed.

.NOTES
    Requires: Azure CLI (logged in), the `containerapp` extension (auto-installed),
    Node.js + pnpm (for the frontend build), and the SWA CLI (auto-installed via npx).
#>
[CmdletBinding()]
param(
    [string]$Subscription = "e103a481-940b-4fe2-bd12-dd92792da17e", # MSDN Platforms
    [string]$ResourceGroup = "tact-ai",
    [string]$Location = "southeastasia",
    [string]$NamePrefix = "tactai",

    # Static Web Apps isn't offered in every region; pick the nearest supported
    # one (southeastasia is not available, eastasia is).
    [string]$SwaLocation = "eastasia",

    # PostgreSQL admin credentials (override the default password!).
    [string]$PgAdminUser = "tactadmin",
    [string]$PgPassword = "",

    # Foundry (existing resource in the same RG).
    [string]$FoundryAccount = "tact-foundry",
    [string]$FoundryModelDeployment = "gpt-4.1",

    [switch]$SkipFrontend,
    [switch]$SkipBackend
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

# --- Derived names (lowercase, ACR must be alphanumeric) --------------------
$acrName = ($NamePrefix + "acr").ToLower()
$pgServer = ($NamePrefix + "-pg").ToLower()
$pgDb = "tact"
$envName = ($NamePrefix + "-cae")           # Container Apps environment
$apiApp = ($NamePrefix + "-api")           # Container App
$swaName = ($NamePrefix + "-web")           # Static Web App
$logName = ($NamePrefix + "-logs")          # Log Analytics workspace
$imageTag = "$acrName.azurecr.io/tact-api:latest"
$repoRoot = Split-Path -Parent $PSScriptRoot
$apiDir = Join-Path $repoRoot "apps/api"
$webDir = Join-Path $repoRoot "apps/web"

if (-not $PgPassword) {
    # Generate a strong password if none supplied.
    $PgPassword = -join ((48..57) + (65..90) + (97..122) + (35, 36, 37, 38, 42) | Get-Random -Count 24 | ForEach-Object { [char]$_ })
    Write-Host "Generated PostgreSQL password (save this!): $PgPassword" -ForegroundColor Yellow
}

Write-Host "==> Using subscription $Subscription" -ForegroundColor Cyan
az account set --subscription $Subscription

# Ensure the containerapp extension is present.
az extension add --name containerapp --upgrade --only-show-errors 2>$null | Out-Null

# --- Foundry key (read from the existing account) ---------------------------
Write-Host "==> Reading Foundry endpoint + key" -ForegroundColor Cyan
$foundryEndpoint = az cognitiveservices account show -g $ResourceGroup -n $FoundryAccount --query "properties.endpoint" -o tsv
$foundryKey = az cognitiveservices account keys list -g $ResourceGroup -n $FoundryAccount --query "key1" -o tsv

if ($SkipBackend) {
    Write-Host "==> Skipping backend (SkipBackend set)" -ForegroundColor DarkYellow
}
else {
    # --- 1. Container Registry ---------------------------------------------
    Write-Host "==> Ensuring ACR $acrName" -ForegroundColor Cyan
    if (-not (az acr show -n $acrName -g $ResourceGroup -o tsv --query name 2>$null)) {
        az acr create -g $ResourceGroup -n $acrName --sku Basic --admin-enabled true -o none
    }

    # --- 2. Build image in the cloud (no local Docker) ---------------------
    Write-Host "==> Building backend image via ACR build" -ForegroundColor Cyan
    az acr build -r $acrName -t "tact-api:latest" -f (Join-Path $apiDir "Dockerfile") $apiDir -o none

    # --- 3. PostgreSQL 17 Flexible Server ----------------------------------
    Write-Host "==> Ensuring PostgreSQL server $pgServer" -ForegroundColor Cyan
    if (-not (az postgres flexible-server show -g $ResourceGroup -n $pgServer -o tsv --query name 2>$null)) {
        az postgres flexible-server create `
            -g $ResourceGroup -n $pgServer -l $Location `
            --version 17 --tier Burstable --sku-name Standard_B1ms `
            --storage-size 32 `
            --admin-user $PgAdminUser --admin-password $PgPassword `
            --public-access 0.0.0.0-255.255.255.255 `
            --database-name $pgDb -o none
    }
    $pgFqdn = az postgres flexible-server show -g $ResourceGroup -n $pgServer --query "fullyQualifiedDomainName" -o tsv
    $databaseUrl = "postgresql+asyncpg://${PgAdminUser}:${PgPassword}@${pgFqdn}:5432/${pgDb}"

    # --- 4. Container Apps environment -------------------------------------
    Write-Host "==> Ensuring Log Analytics + Container Apps environment" -ForegroundColor Cyan
    if (-not (az monitor log-analytics workspace show -g $ResourceGroup -n $logName -o tsv --query name 2>$null)) {
        az monitor log-analytics workspace create -g $ResourceGroup -n $logName -l $Location -o none
    }
    $logId = az monitor log-analytics workspace show -g $ResourceGroup -n $logName --query customerId -o tsv
    $logKey = az monitor log-analytics workspace get-shared-keys -g $ResourceGroup -n $logName --query primarySharedKey -o tsv

    if (-not (az containerapp env show -g $ResourceGroup -n $envName -o tsv --query name 2>$null)) {
        az containerapp env create `
            -g $ResourceGroup -n $envName -l $Location `
            --logs-workspace-id $logId --logs-workspace-key $logKey -o none
    }

    # --- 5. ACR credentials for the Container App --------------------------
    $acrServer = az acr show -n $acrName -g $ResourceGroup --query loginServer -o tsv
    $acrUser = az acr credential show -n $acrName --query username -o tsv
    $acrPass = az acr credential show -n $acrName --query "passwords[0].value" -o tsv

    # --- 6. Deploy / update the backend Container App ----------------------
    Write-Host "==> Deploying backend Container App $apiApp" -ForegroundColor Cyan
    $exists = az containerapp show -g $ResourceGroup -n $apiApp -o tsv --query name 2>$null
    if (-not $exists) {
        az containerapp create `
            -g $ResourceGroup -n $apiApp --environment $envName `
            --image "$acrServer/tact-api:latest" `
            --registry-server $acrServer --registry-username $acrUser --registry-password $acrPass `
            --target-port 8000 --ingress external `
            --min-replicas 1 --max-replicas 2 `
            --cpu 0.5 --memory 1.0Gi `
            --secrets "db-url=$databaseUrl" "foundry-key=$foundryKey" `
            --env-vars `
            "environment=production" `
            "database_url=secretref:db-url" `
            "cors_allow_origins=http://localhost:5173" `
            "ai_foundry_endpoint=$foundryEndpoint" `
            "ai_foundry_api_key=secretref:foundry-key" `
            "ai_model_deployment=$FoundryModelDeployment" `
            -o none
    }
    else {
        az containerapp registry set -g $ResourceGroup -n $apiApp `
            --server $acrServer --username $acrUser --password $acrPass -o none
        az containerapp secret set -g $ResourceGroup -n $apiApp `
            --secrets "db-url=$databaseUrl" "foundry-key=$foundryKey" -o none
        az containerapp update -g $ResourceGroup -n $apiApp `
            --image "$acrServer/tact-api:latest" `
            --set-env-vars `
            "environment=production" `
            "database_url=secretref:db-url" `
            "ai_foundry_endpoint=$foundryEndpoint" `
            "ai_foundry_api_key=secretref:foundry-key" `
            "ai_model_deployment=$FoundryModelDeployment" `
            -o none
    }

    $script:ApiFqdn = az containerapp show -g $ResourceGroup -n $apiApp --query "properties.configuration.ingress.fqdn" -o tsv
    Write-Host "==> Backend live at: https://$script:ApiFqdn" -ForegroundColor Green
}

if ($SkipFrontend) {
    Write-Host "==> Skipping frontend (SkipFrontend set)" -ForegroundColor DarkYellow
    return
}

# --- 7. Frontend: build with the backend origin, deploy to SWA --------------
if (-not (Get-Variable -Name ApiFqdn -Scope Script -ErrorAction SilentlyContinue) -or -not $script:ApiFqdn) {
    $script:ApiFqdn = az containerapp show -g $ResourceGroup -n $apiApp --query "properties.configuration.ingress.fqdn" -o tsv
}
$apiBase = "https://$script:ApiFqdn"

Write-Host "==> Building frontend (VITE_API_BASE=$apiBase)" -ForegroundColor Cyan
Push-Location $webDir
try {
    $env:VITE_API_BASE = $apiBase
    pnpm install --frozen-lockfile
    pnpm build
}
finally {
    Pop-Location
}

Write-Host "==> Ensuring Static Web App $swaName" -ForegroundColor Cyan
if (-not (az staticwebapp show -g $ResourceGroup -n $swaName -o tsv --query name 2>$null)) {
    az staticwebapp create -g $ResourceGroup -n $swaName -l $SwaLocation --sku Free -o none
}
$swaToken = az staticwebapp secrets list -g $ResourceGroup -n $swaName --query "properties.apiKey" -o tsv

Write-Host "==> Deploying frontend bundle via SWA CLI" -ForegroundColor Cyan
npx --yes @azure/static-web-apps-cli deploy (Join-Path $webDir "dist") `
    --deployment-token $swaToken --env production

$swaHost = az staticwebapp show -g $ResourceGroup -n $swaName --query "defaultHostname" -o tsv
$swaUrl = "https://$swaHost"
Write-Host "==> Frontend live at: $swaUrl" -ForegroundColor Green

# --- 8. Allow the SWA origin through backend CORS ---------------------------
Write-Host "==> Updating backend CORS to allow $swaUrl" -ForegroundColor Cyan
az containerapp update -g $ResourceGroup -n $apiApp `
    --set-env-vars "cors_allow_origins=$swaUrl,http://localhost:5173" -o none

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Green
Write-Host " TACT AI deployed" -ForegroundColor Green
Write-Host "  Frontend: $swaUrl"
Write-Host "  Backend:  $apiBase"
Write-Host "  API docs: $apiBase/docs"
Write-Host "=====================================================" -ForegroundColor Green
