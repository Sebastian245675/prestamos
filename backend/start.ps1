# Script para iniciar el backend con variables de entorno configuradas
# Asegúrate de configurar estas variables con tus credenciales de Supabase

# Configura las variables de entorno para la conexión a Supabase
# IMPORTANTE: Reemplaza [YOUR-PASSWORD] con tu contraseña real de Supabase
$env:SPRING_DATASOURCE_URL = "postgresql://postgres.ijjskcroggxijvxronqy:[YOUR-PASSWORD]@aws-1-us-east-1.pooler.supabase.com:5432/postgres"
$env:SPRING_DATASOURCE_USERNAME = "postgres.ijjskcroggxijvxronqy"
$env:SPRING_DATASOURCE_PASSWORD = "[YOUR-PASSWORD]"

Write-Host "Variables de entorno configuradas" -ForegroundColor Green
Write-Host "IMPORTANTE: Asegúrate de reemplazar [YOUR-PASSWORD] con tu contraseña real" -ForegroundColor Yellow
Write-Host "Iniciando backend..." -ForegroundColor Cyan

# Navega al directorio backend y ejecuta Maven con perfil local
Set-Location $PSScriptRoot
.\mvnw.cmd clean spring-boot:run -Dspring-boot.run.profiles=local

