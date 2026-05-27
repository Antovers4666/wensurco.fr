# Script PowerShell de déploiement automatique Netlify
# Méthode : File Digest API (fiable, pas de problème de paths)
# Usage : .\deploy-netlify.ps1

$token = "nfp_fz9PqTB7CwUGDE2mHgFNTJKpKbQ46NRJ9448"
$siteId = "328933e1-8b6a-47a3-b506-bfbb9204944b"
$sourceDir = "C:\Users\linkl\Desktop\CalcAutoEntrepreneur"

Write-Host "=== Déploiement wensurco.fr sur Netlify ===" -ForegroundColor Cyan

# 1. Calculer les hashes SHA1 de tous les fichiers
$fileMap = @{}
Get-ChildItem -Path $sourceDir -Recurse -File | Where-Object { $_.Name -notmatch "DEPLOYMENT_READY|deploy-netlify" } | ForEach-Object {
    $rel = "/" + $_.FullName.Substring($sourceDir.Length + 1).Replace('\', '/')
    $sha1 = (Get-FileHash -Path $_.FullName -Algorithm SHA1).Hash.ToLower()
    $fileMap[$rel] = $sha1
}
Write-Host "Fichiers à déployer : $($fileMap.Count)" -ForegroundColor Yellow

# 2. Créer le déploiement avec les digests
$filesJson = ($fileMap.GetEnumerator() | ForEach-Object { """$($_.Key)"":""$($_.Value)""" }) -join ","
$body = "{""files"":{$filesJson}}"
$deploy = Invoke-RestMethod -Uri "https://api.netlify.com/api/v1/sites/$siteId/deploys" -Method Post -Headers @{Authorization="Bearer $token"; "Content-Type"="application/json"} -Body $body
$deployId = $deploy.id
Write-Host "Deploy créé : $deployId" -ForegroundColor Yellow
Write-Host "Fichiers requis : $($deploy.required.Count)" -ForegroundColor Yellow

# 3. Uploader les fichiers manquants
# Netlify retourne les SHA1 manquants (pas les chemins) — on inverse le map
$hashToPath = @{}
foreach ($entry in $fileMap.GetEnumerator()) {
    $hashToPath[$entry.Value] = $entry.Key
}

if ($deploy.required.Count -gt 0) {
    foreach ($sha1 in $deploy.required) {
        $relPath = $hashToPath[$sha1]
        if (-not $relPath) {
            Write-Host "  Hash inconnu : $sha1 (ignore)" -ForegroundColor Gray
            continue
        }
        $localPath = Join-Path $sourceDir $relPath.TrimStart('/').Replace('/', '\')
        if (-not (Test-Path $localPath)) {
            Write-Host "  Fichier introuvable : $localPath" -ForegroundColor Red
            continue
        }
        $bytes = [System.IO.File]::ReadAllBytes($localPath)
        $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
        $ct = switch ($ext) {
            ".html" { "text/html; charset=utf-8" }
            ".css"  { "text/css" }
            ".js"   { "application/javascript" }
            ".xml"  { "application/xml" }
            ".txt"  { "text/plain" }
            default { "application/octet-stream" }
        }
        Invoke-RestMethod -Uri "https://api.netlify.com/api/v1/deploys/$deployId/files$relPath" -Method Put -Headers @{Authorization="Bearer $token"; "Content-Type"=$ct} -Body $bytes | Out-Null
        Write-Host "  Uploade : $relPath" -ForegroundColor Green
    }
}


# 4. Vérifier l'état
Start-Sleep -Seconds 3
$status = Invoke-RestMethod -Uri "https://api.netlify.com/api/v1/deploys/$deployId" -Headers @{Authorization="Bearer $token"}
Write-Host "=== Résultat ===" -ForegroundColor Cyan
Write-Host "État : $($status.state)" -ForegroundColor Green
Write-Host "URL  : $($status.ssl_url)" -ForegroundColor Green
Write-Host "=== Déploiement terminé ! ===" -ForegroundColor Cyan
