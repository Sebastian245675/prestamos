# Configuración del Backend

## Variables de Entorno Requeridas

Para que el backend funcione, necesitas configurar las siguientes variables de entorno con tus credenciales de Supabase:

```powershell
$env:SPRING_DATASOURCE_URL = "postgresql://postgres.ijjskcroggxijvxronqy:TU_CONTRASEÑA_AQUI@aws-1-us-east-1.pooler.supabase.com:5432/postgres"
$env:SPRING_DATASOURCE_USERNAME = "postgres.ijjskcroggxijvxronqy"
$env:SPRING_DATASOURCE_PASSWORD = "TU_CONTRASEÑA_AQUI"
```

## Opción 1: Usar el script start.ps1

1. Edita `backend/start.ps1` y reemplaza `[YOUR-PASSWORD]` con tu contraseña real
2. Ejecuta: `.\start.ps1`

## Opción 2: Configurar manualmente en PowerShell

Ejecuta estos comandos en PowerShell:

```powershell
cd backend
$env:SPRING_DATASOURCE_URL = "postgresql://postgres.ijjskcroggxijvxronqy:TU_CONTRASEÑA@aws-1-us-east-1.pooler.supabase.com:5432/postgres"
$env:SPRING_DATASOURCE_USERNAME = "postgres.ijjskcroggxijvxronqy"
$env:SPRING_DATASOURCE_PASSWORD = "TU_CONTRASEÑA"
.\mvnw.cmd clean spring-boot:run
```

**IMPORTANTE**: Reemplaza `TU_CONTRASEÑA` con tu contraseña real de Supabase.

