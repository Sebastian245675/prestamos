# 🚀 Guía Rápida - Ejecutar Script en Supabase

## ⚠️ IMPORTANTE: Este script ELIMINA todas las tablas existentes

Si ya tienes datos en Supabase, haz un backup primero o ejecuta el script solo si la base de datos está vacía.

## 📋 Pasos para Ejecutar

### Paso 1: Ir al SQL Editor de Supabase

1. Abre tu proyecto en Supabase Dashboard
2. En el menú lateral izquierdo, haz clic en **"SQL Editor"**
3. Haz clic en **"New query"** (Nueva consulta)

### Paso 2: Copiar y Ejecutar el Script

1. Abre el archivo: `database/supabase_schema.sql`
2. **Copia TODO el contenido** (todas las líneas)
3. Pega el contenido en el editor SQL de Supabase
4. Haz clic en **"Run"** (botón verde) o presiona `Ctrl + Enter`

### Paso 3: Verificar

1. Ve a **"Table Editor"** en el menú lateral
2. Deberías ver **8 tablas**:
   - ✅ usuarios
   - ✅ prestamos
   - ✅ abonos
   - ✅ cuotas
   - ✅ movimientos
   - ✅ referidos
   - ✅ rutas
   - ✅ suscripciones

### Paso 4: Configurar Backend

Abre `backend/src/main/resources/application.yml` y configura:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://db.ijjskcroggxijvxronqy.supabase.co:5432/postgres?sslmode=require
    username: postgres
    password: TU_PASSWORD_DE_SUPABASE
```

**Para obtener tu password:**
- Ve a **Project Settings** → **Database** → **Database password**

## ✅ ¡Listo!

Después de ejecutar el script, tu base de datos estará completamente configurada y lista para usar con el backend Spring Boot.
