# Script para instalar Java 17 y configurar el proyecto
# Ejecutar como administrador

Write-Host "Descargando Java 17..." -ForegroundColor Yellow

$java17Url = "https://api.adoptium.net/v3/binary/latest/17/ga/windows/x64/jdk/hotspot/normal/eclipse"
$downloadPath = "$env:TEMP\jdk-17.zip"
$installPath = "C:\Program Files\Java\jdk-17"

try {
    # Descargar Java 17
    Invoke-WebRequest -Uri $java17Url -OutFile $downloadPath -UseBasicParsing
    
    Write-Host "Extrayendo Java 17..." -ForegroundColor Yellow
    
    # Extraer
    Expand-Archive -Path $downloadPath -DestinationPath "$env:TEMP\jdk-17-temp" -Force
    
    # Mover a la ubicación final
    $extractedFolder = Get-ChildItem "$env:TEMP\jdk-17-temp" -Directory | Select-Object -First 1
    if (Test-Path $installPath) {
        Remove-Item $installPath -Recurse -Force
    }
    Move-Item $extractedFolder.FullName $installPath -Force
    
    # Configurar JAVA_HOME
    [System.Environment]::SetEnvironmentVariable("JAVA_HOME", $installPath, [System.EnvironmentVariableTarget]::Machine)
    $env:JAVA_HOME = $installPath
    
    Write-Host "Java 17 instalado en: $installPath" -ForegroundColor Green
    Write-Host "JAVA_HOME configurado. Por favor, reinicia tu terminal." -ForegroundColor Green
    
    # Limpiar
    Remove-Item $downloadPath -Force -ErrorAction SilentlyContinue
    Remove-Item "$env:TEMP\jdk-17-temp" -Recurse -Force -ErrorAction SilentlyContinue
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "Por favor, descarga Java 17 manualmente desde: https://adoptium.net/" -ForegroundColor Yellow
}

