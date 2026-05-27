# ============================================================
# launch-browser.ps1 - Lancement Chrome + Debug MCP pour wensurco.fr
# Utilise un profil Chrome ISOLE (AntigravityDebug)
# Votre Chrome personnel n'est pas touche
# Usage : powershell -ExecutionPolicy Bypass -File ".\launch-browser.ps1"
# Options : -TestPages, -Lighthouse, -KillDebug, -Url <url>
# ============================================================

param(
    [switch]$TestPages,
    [switch]$Lighthouse,
    [switch]$KillDebug,
    [string]$Url = "https://wensurco.fr"
)

$ChromePath   = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$DebugPort    = 9222
$DebugProfile = "$env:LOCALAPPDATA\Google\Chrome\AntigravityDebug"
$SiteUrl      = $Url

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  wensurco.fr - Chrome Debug (profil isole)" -ForegroundColor Cyan
Write-Host "  Port $DebugPort - Profil : AntigravityDebug" -ForegroundColor Gray
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# -- 1. Fermer l'instance debug Chrome si demande ---------------
if ($KillDebug) {
    Write-Host "[>>] Fermeture de l'instance Chrome debug..." -ForegroundColor Yellow
    Get-Process chrome -ErrorAction SilentlyContinue | ForEach-Object {
        $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId=$($_.Id)" -ErrorAction SilentlyContinue).CommandLine
        if ($cmdLine -match "AntigravityDebug|remote-debugging-port=$DebugPort") {
            $_ | Stop-Process -Force
        }
    }
    Start-Sleep -Seconds 2
}

# -- 2. Verifier si port debug deja actif -----------------------
$debugActive = $false
try {
    $resp = Invoke-WebRequest -Uri "http://127.0.0.1:$DebugPort/json/version" `
        -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    $info = $resp.Content | ConvertFrom-Json
    $debugActive = $true
    Write-Host "[OK] Chrome DevTools deja actif : $($info.Browser)" -ForegroundColor Green
} catch {
    Write-Host "[>>] Lancement Chrome (profil debug isole)..." -ForegroundColor Yellow
    Write-Host "     Votre Chrome personnel n'est pas affecte" -ForegroundColor Gray
}

# -- 3. Lancer Chrome avec profil debug isole -------------------
if (-not $debugActive) {
    if (-not (Test-Path $DebugProfile)) {
        New-Item -ItemType Directory -Path $DebugProfile -Force | Out-Null
    }

    # Lancer Chrome de façon vraiment détachée (survit après fermeture du script)
    $args = "--remote-debugging-port=$DebugPort --remote-debugging-address=127.0.0.1 --no-first-run --no-default-browser-check --disable-sync --user-data-dir=`"$DebugProfile`" --window-size=1600,900 `"$SiteUrl`""
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c start `"`" `"$ChromePath`" $args" -WindowStyle Hidden

    Write-Host "[..] Attente demarrage Chrome..." -ForegroundColor Gray
    Start-Sleep -Seconds 3

    $started = $false
    for ($i = 1; $i -le 12; $i++) {
        try {
            $resp = Invoke-WebRequest -Uri "http://127.0.0.1:$DebugPort/json/version" `
                -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
            $info = $resp.Content | ConvertFrom-Json
            $started = $true
            Write-Host "[OK] $($info.Browser) demarre sur port $DebugPort" -ForegroundColor Green
            break
        } catch {
            Write-Host "     Tentative $i/12..." -ForegroundColor Gray
            Start-Sleep -Seconds 1
        }
    }

    if (-not $started) {
        Write-Host "[ERR] Chrome n'a pas demarre sur port $DebugPort" -ForegroundColor Red
        Write-Host "Essaie -KillDebug si une ancienne instance bloque le port" -ForegroundColor Yellow
        exit 1
    }
}

# -- 4. Afficher onglets ----------------------------------------
Write-Host ""
Write-Host "[i] Onglets actifs :" -ForegroundColor Cyan
try {
    $tabs = Invoke-RestMethod -Uri "http://127.0.0.1:$DebugPort/json" -TimeoutSec 5
    $pageTabs = $tabs | Where-Object { $_.type -eq "page" }
    if ($pageTabs.Count -gt 0) {
        $pageTabs | Select-Object -First 10 | ForEach-Object {
            $title = if ($_.title.Length -gt 60) { $_.title.Substring(0,60) + "..." } else { $_.title }
            Write-Host "    - $title" -ForegroundColor White
        }
    } else {
        Write-Host "    (aucun onglet)" -ForegroundColor Gray
    }
} catch { Write-Host "    (erreur lecture onglets)" -ForegroundColor Gray }

# -- 5. Test HTTP de toutes les pages ---------------------------
if ($TestPages) {
    Write-Host ""
    Write-Host "[>>] Test HTTP de toutes les pages wensurco.fr..." -ForegroundColor Cyan
    Write-Host ""

    $pages = @(
        @{ Name = "Accueil";              Url = "https://wensurco.fr/" },
        @{ Name = "Calcul charges";       Url = "https://wensurco.fr/calcul-charges-auto-entrepreneur.html" },
        @{ Name = "Simulateur revenu";    Url = "https://wensurco.fr/simulateur-revenu-net-auto-entrepreneur.html" },
        @{ Name = "Plafond CA";           Url = "https://wensurco.fr/plafond-chiffre-affaires-micro-entreprise.html" },
        @{ Name = "Indemnites km";        Url = "https://wensurco.fr/indemnites-kilometriques-2025.html" },
        @{ Name = "ACRE";                 Url = "https://wensurco.fr/calcul-acre-auto-entrepreneur.html" },
        @{ Name = "Calendrier";           Url = "https://wensurco.fr/calendrier-declarations-auto-entrepreneur.html" },
        @{ Name = "Guide 2025";           Url = "https://wensurco.fr/guide-auto-entrepreneur-2025.html" },
        @{ Name = "FAQ";                  Url = "https://wensurco.fr/faq-auto-entrepreneur.html" },
        @{ Name = "CFE";                  Url = "https://wensurco.fr/cfe-auto-entrepreneur-2025.html" },
        @{ Name = "Arret maladie";        Url = "https://wensurco.fr/arret-maladie-auto-entrepreneur.html" },
        @{ Name = "Chomage + AE";         Url = "https://wensurco.fr/cumul-chomage-auto-entrepreneur.html" },
        @{ Name = "Retraite";             Url = "https://wensurco.fr/retraite-auto-entrepreneur.html" },
        @{ Name = "Frais deductibles";    Url = "https://wensurco.fr/frais-deductibles-micro-entreprise.html" },
        @{ Name = "TVA";                  Url = "https://wensurco.fr/tva-auto-entrepreneur.html" },
        @{ Name = "Compte bancaire pro";  Url = "https://wensurco.fr/compte-bancaire-pro-auto-entrepreneur.html" },
        @{ Name = "RC Pro";               Url = "https://wensurco.fr/rc-pro-auto-entrepreneur.html" },
        @{ Name = "Mentions legales";     Url = "https://wensurco.fr/mentions-legales.html" },
        @{ Name = "Confidentialite";      Url = "https://wensurco.fr/confidentialite.html" }
    )

    $ok = 0; $fail = 0
    foreach ($page in $pages) {
        try {
            $r = Invoke-WebRequest -Uri $page.Url -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
            if ($r.StatusCode -eq 200) {
                Write-Host ("  [OK] {0,-24} {1}" -f $page.Name, $r.StatusCode) -ForegroundColor Green
                $ok++
            } else {
                Write-Host ("  [!!] {0,-24} {1}" -f $page.Name, $r.StatusCode) -ForegroundColor Yellow
                $fail++
            }
        } catch {
            $code = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { "ERR" }
            Write-Host ("  [ER] {0,-24} {1}" -f $page.Name, $code) -ForegroundColor Red
            $fail++
        }
    }

    Write-Host ""
    if ($fail -eq 0) {
        Write-Host "[OK] Toutes les pages OK : $ok/$($pages.Count)" -ForegroundColor Green
    } else {
        Write-Host "[!!] $ok/$($pages.Count) OK | $fail erreur(s)" -ForegroundColor Yellow
    }
}

# -- 6. Lighthouse SEO/Perf -------------------------------------
if ($Lighthouse) {
    Write-Host ""
    Write-Host "[>>] Audit Lighthouse sur $SiteUrl..." -ForegroundColor Cyan
    $env:PATH = "C:\Program Files\nodejs;" + $env:PATH

    $lighthouseBin = "$env:APPDATA\npm\lighthouse.cmd"
    if (-not (Test-Path $lighthouseBin)) {
        Write-Host "[..] Installation Lighthouse..." -ForegroundColor Yellow
        & "C:\Program Files\nodejs\npm.cmd" install -g lighthouse 2>&1 | Out-Null
    }

    $stamp      = Get-Date -Format "yyyyMMdd-HHmm"
    $reportPath = "$PSScriptRoot\lighthouse-$stamp.html"

    & $lighthouseBin $SiteUrl `
        "--port=$DebugPort" `
        "--chrome-path=$ChromePath" `
        --output=html `
        "--output-path=$reportPath" `
        --quiet 2>&1

    if (Test-Path $reportPath) {
        Write-Host "[OK] Rapport Lighthouse : $reportPath" -ForegroundColor Green
        Start-Process $reportPath
    }
}

# -- 7. Resume --------------------------------------------------
Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  Chrome pret pour Antigravity IDE !" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host ("  DevTools   : http://127.0.0.1:$DebugPort")  -ForegroundColor White
Write-Host ("  MCP Chrome : http://127.0.0.1:12306/mcp")   -ForegroundColor White
Write-Host ("  Profil     : AntigravityDebug (isole)")      -ForegroundColor Gray
Write-Host ("  Site live  : https://wensurco.fr")           -ForegroundColor White
Write-Host ""
Write-Host "  Options :"                                     -ForegroundColor Gray
Write-Host "    -TestPages  : Tester toutes les pages"      -ForegroundColor Gray
Write-Host "    -Lighthouse : Audit SEO + Performance"       -ForegroundColor Gray
Write-Host "    -KillDebug  : Fermer l'instance debug"       -ForegroundColor Gray
Write-Host "    -Url <url>  : URL d'ouverture specifique"    -ForegroundColor Gray
Write-Host ""
