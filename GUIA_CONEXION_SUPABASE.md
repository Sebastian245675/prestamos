# 🔑 Guía Paso a Paso: Configurar Supabase para Backend Spring Boot

## ⚠️ IMPORTANTE: Dos URLs Diferentes

### ❌ URL que NO necesitas (API REST):
```
https://ijjskcroggxijvxronqy.supabase.co
```
Esta es para usar la API REST de Supabase desde JavaScript/TypeScript.

### ✅ URL que SÍ necesitas (PostgreSQL JDBC):
```
jdbc:postgresql://db.ijjskcroggxijvxronqy.supabase.co:5432/postgres?sslmode=require
```
Esta es para conectar Spring Boot directamente a PostgreSQL.

---

## 📋 Paso a Paso para Obtener la Conexión JDBC

### Paso 1: Ir a Project Settings → Database

1. En tu dashboard de Supabase, ve a **Project Settings** (el ícono de engranaje ⚙️)
2. Haz clic en **Database** en el menú lateral

### Paso 2: Buscar "Connection string"

En la página de Database, busca la sección **"Connection string"** o **"Connection info"**.

Deberías ver algo como:

```
postgresql://postgres:[YOUR-PASSWORD]@db.ijjskcroggxijvxronqy.supabase.co:5432/postgres
```

O en formato de conexión:

```
Host: db.ijjskcroggxijvxronqy.supabase.co
Port: 5432
Database: postgres
User: postgres
Password: [YOUR-PASSWORD]
```

### Paso 3: Convertir a formato JDBC

De la información anterior, construye la URL JDBC:

```
jdbc:postgresql://db.ijjskcroggxijvxronqy.supabase.co:5432/postgres?sslmode=require
```

**Partes importantes:**
- `db.ijjskcroggxijvxronqy.supabase.co` - Host (nota el `db.` al inicio)
- `5432` - Puerto de PostgreSQL
- `postgres` - Nombre de la base de datos
- `?sslmode=require` - Requerido para Supabase

### Paso 4: Obtener el Password

1. En la misma página de **Project Settings → Database**
2. Busca **"Database password"**
3. Si no lo recuerdas, haz clic en **"Reset database password"**
4. Copia el password (guárdalo en un lugar seguro)

---

## 🔧 Configurar application.yml

Una vez que tengas la URL JDBC y el password, actualiza `backend/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://db.ijjskcroggxijvxronqy.supabase.co:5432/postgres?sslmode=require
    username: postgres
    password: TU_PASSWORD_AQUI  # ← Pega aquí el password de PostgreSQL
```

---

## 📸 Si No Encuentras la Connection String

Si no ves la "Connection string" directamente:

1. Ve a **Project Settings → Database**
2. Busca cualquier sección que mencione **"Connection"**, **"Database"**, o **"PostgreSQL"**
3. También puedes buscar en **"Connection pooling"** o **"Direct connection"**

**Alternativa:** Si solo ves la URL de la API (`https://ijjskcroggxijvxronqy.supabase.co`):
- El host de PostgreSQL será: `db.ijjskcroggxijvxronqy.supabase.co` (agrega `db.` al inicio)
- Puerto: `5432`
- Database: `postgres`
- Username: `postgres`
- Password: El que configuraste al crear el proyecto

---

## ✅ Verificación

Después de configurar, ejecuta el backend:

```bash
cd backend
mvn spring-boot:run
```

Si ves:
```
Started PrestacolApplication in X.XXX seconds
```

¡La conexión está funcionando! 🎉

Si ves errores de conexión, verifica:
1. ✅ La URL tiene `db.` al inicio (no solo `ijjskcroggxijvxronqy.supabase.co`)
2. ✅ La URL tiene `?sslmode=require` al final
3. ✅ El password es correcto
4. ✅ El puerto es `5432`

---

## 🆘 Si Aún No Encuentras la Información

1. Busca en Supabase Dashboard → Project Settings → Database
2. Busca cualquier texto que diga "Connection string", "PostgreSQL", o "Database connection"
3. O simplemente usa:
   - Host: `db.ijjskcroggxijvxronqy.supabase.co`
   - Port: `5432`
   - Database: `postgres`
   - Username: `postgres`
   - Password: Resetea el password si no lo recuerdas

