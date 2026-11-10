# PowerShell launcher for VIGILIA on Windows
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $scriptDir "..")

$OLLAMA_URL = if ($env:VIGILIA_OLLAMA_URL) { $env:VIGILIA_OLLAMA_URL } else { "http://127.0.0.1:11434" }
$API_URL = "http://127.0.0.1:8000/api/health"
$WEB_URL = "http://127.0.0.1:5173"
$RUNTIME_DIR = Join-Path $env:TEMP "vigilia-runtime"
if (-not (Test-Path $RUNTIME_DIR)) { New-Item -ItemType Directory -Path $RUNTIME_DIR -Force | Out-Null }

$startedProcesses = [System.Collections.Generic.List[System.Diagnostics.Process]]::new()

function Cleanup {
    Write-Host "`nArrêt des services VIGILIA…" -ForegroundColor Yellow
    foreach ($proc in $startedProcesses) {
        if (-not $proc.HasExited) {
            try { Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue } catch {}
        }
    }
}

function Wait-For-Url($url, $label, $attempts = 40) {
    for ($i = 1; $i -le $attempts; $i++) {
        try {
            $resp = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 1 -UseBasicParsing -ErrorAction Stop
            if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 400) { return $true }
        } catch {
            Start-Sleep -Milliseconds 250
        }
    }
    Write-Host "Échec du démarrage de $label. Consultez $RUNTIME_DIR." -ForegroundColor Red
    return $false
}

Write-Host "VIGILIA — démarrage local (Windows)" -ForegroundColor Cyan

# Check Python environment
$pythonBin = ".venv\Scripts\python.exe"
$uvicornBin = ".venv\Scripts\uvicorn.exe"

if (-not (Test-Path $uvicornBin)) {
    Write-Host "Configuration du backend Python (.venv)..." -ForegroundColor Yellow
    $sysPython = if (Get-Command python -ErrorAction SilentlyContinue) { "python" } elseif (Get-Command py -ErrorAction SilentlyContinue) { "py" } else { $null }
    if (-not $sysPython) {
        Write-Host "Python 3.11+ est requis mais introuvable dans le PATH." -ForegroundColor Red
        exit 1
    }
    & $sysPython -m venv .venv
    & $pythonBin -m pip install --quiet --upgrade pip
    & $pythonBin -m pip install --quiet -r server\requirements.txt
}

# Check Ollama
if (Get-Command ollama -ErrorAction SilentlyContinue) {
    $ollamaActive = $false
    try {
        $resp = Invoke-WebRequest -Uri "$OLLAMA_URL/api/tags" -TimeoutSec 1 -UseBasicParsing -ErrorAction Stop
        if ($resp.StatusCode -eq 200) { $ollamaActive = $true }
    } catch {}

    if ($ollamaActive) {
        Write-Host "✓ Ollama est déjà actif" -ForegroundColor Green
    } else {
        Write-Host "Démarrage d'Ollama..." -ForegroundColor Yellow
        $ollamaLog = Join-Path $RUNTIME_DIR "ollama.log"
        $proc = Start-Process -FilePath "ollama" -ArgumentList "serve" -RedirectStandardOutput $ollamaLog -RedirectStandardError $ollamaLog -PassThru
        $startedProcesses.Add($proc)
        if (-not (Wait-For-Url "$OLLAMA_URL/api/tags" "Ollama")) { exit 1 }
    }
} else {
    Write-Host "⚠️ Ollama n'est pas détecté dans le PATH (recherche lexicale seule active)." -ForegroundColor DarkYellow
}

# Ingest check
$docCount = 0
if (Test-Path "data\vigilia.db") {
    try {
        $docCount = & $pythonBin -c "import sqlite3; db=sqlite3.connect('data/vigilia.db'); print(db.execute('SELECT COUNT(*) FROM documents').fetchone()[0])"
    } catch { $docCount = 0 }
}

if ([int]$docCount -eq 0) {
    Write-Host "Initialisation du corpus juridique officiel..." -ForegroundColor Yellow
    & $pythonBin -m server.ingest
} else {
    Write-Host "✓ Corpus local : $docCount document(s)" -ForegroundColor Green
}

# Start API
$apiActive = $false
try {
    $resp = Invoke-WebRequest -Uri $API_URL -TimeoutSec 1 -UseBasicParsing -ErrorAction Stop
    if ($resp.StatusCode -eq 200) { $apiActive = $true }
} catch {}

if ($apiActive) {
    Write-Host "✓ API VIGILIA déjà active" -ForegroundColor Green
} else {
    Write-Host "Démarrage de l'API VIGILIA..." -ForegroundColor Yellow
    $apiLog = Join-Path $RUNTIME_DIR "api.log"
    $proc = Start-Process -FilePath $uvicornBin -ArgumentList "server.app:app --host 127.0.0.1 --port 8000" -RedirectStandardOutput $apiLog -RedirectStandardError $apiLog -PassThru
    $startedProcesses.Add($proc)
    if (-not (Wait-For-Url $API_URL "l'API VIGILIA")) {
        Cleanup
        exit 1
    }
}

try {
    Write-Host "✓ Ouverture de VIGILIA sur $WEB_URL" -ForegroundColor Green
    Write-Host "  Logs : $RUNTIME_DIR" -ForegroundColor Gray
    Write-Host "  Arrêt : Ctrl+C" -ForegroundColor Gray
    npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
} finally {
    Cleanup
}

