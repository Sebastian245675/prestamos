# 🔑 Configuración de Supabase para Backend Spring Boot

## ⚠️ IMPORTANTE: Diferencias entre API Keys y Credenciales de BD

### ❌ NO necesitas las API Keys para el backend
Las **API Keys** (`anon`, `service_role`) que ves en Supabase son para:
- Usar el cliente de Supabase desde JavaScript/TypeScript
- Llamar a los servicios REST de Supabase
- Usar funciones serverless de Supabase

### ✅ SÍ necesitas las Credenciales de PostgreSQL
El backend Spring Boot se conecta **directamente a PostgreSQL** usando JDBC, así que necesitas:

1. **URL de conexión JDBC**
2. **Username** (siempre es `postgres`)
3. **Password** de la base de datos

## 📋 Cómo Obtener las Credenciales Correctas

### Paso 1: Obtener la URL de Conexión

1. Ve a **Project Settings** → **Database**
2. Busca la sección **Connection string**
3. Verás algo como:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.ijjskcroggxijvxronqy.supabase.co:5432/postgres
   ```

4. Convierte a formato JDBC:
   ```
   jdbc:postgresql://db.ijjskcroggxijvxronqy.supabase.co:5432/postgres?sslmode=require
   ```

### Paso 2: Obtener el Password

1. En la misma página **Project Settings** → **Database**
2. Busca **Database password**
3. Si no lo recuerdas, haz clic en **"Reset database password"**
4. Copia el password (guárdalo en un lugar seguro)

### Paso 3: Configurar application.yml

```yaml
spring:
  datasource:
    url: jdbc:postgresql://db.ijjskcroggxijvxronqy.supabase.co:5432/postgres?sslmode=require
    username: postgres
    password: TU_PASSWORD_AQUI
```

## 🔒 Seguridad

- ✅ **NO compartas** el password de la base de datos
- ✅ **NO uses** las API keys en el backend (solo si usas Supabase client)
- ✅ En producción, usa variables de entorno para el password

## 📝 Resumen

| Qué necesitas | Dónde encontrarlo |
|--------------|-------------------|
| URL JDBC | Project Settings → Database → Connection string |
| Username | Siempre es `postgres` |
| Password | Project Settings → Database → Database password |

---

**¿Dudas?** El backend solo necesita conectarse a PostgreSQL como cualquier aplicación Java.

