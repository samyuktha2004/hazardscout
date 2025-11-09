# PowerShell script to fix version-specific imports
Get-ChildItem -Recurse -Include "*.tsx", "*.ts" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $newContent = $content -replace '@\d+\.\d+\.\d+', ''
    Set-Content -Path $_.FullName -Value $newContent -NoNewline
}
Write-Host "Fixed all version-specific imports!"
