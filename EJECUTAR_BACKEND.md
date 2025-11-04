# 🚀 Cómo Ejecutar el Backend

## 📋 Requisitos Previos

1. ✅ **Java 17** instalado (verificar con `java -version`)
2. ✅ **Maven** instalado (verificar con `mvn -version`)
3. ✅ Base de datos configurada en Supabase (ya hecho ✅)

## 🔧 Paso 1: Configurar Conexión a Supabase

Abre el archivo `backend/src/main/resources/application.yml` y actualiza la sección de `datasource`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://db.TU_PROYECTO.supabase.co:5432/postgres?sslmode=require
    username: postgres
    password: TU_PASSWORD_DE_SUPABASE
```

**Para obtener tus credenciales de PostgreSQL:**

1. Ve a tu proyecto en Supabase Dashboard
2. Ve a **Project Settings** → **Database**
3. Busca la sección **"Connection string"** o **"Connection info"**
4. Busca **"Database password"** (si no lo recuerdas, puedes resetearlo)

**📖 Ver guía completa:** `GUIA_CONEXION_SUPABASE.md`

**⚠️ IMPORTANTE: NO necesitas las "API Keys"**
- Las API Keys son para usar Supabase desde el frontend
- Para el backend Spring Boot solo necesitas: URL, username y password de PostgreSQL

**Ejemplo de URL:**
- Tu proyecto es: `ijjskcroggxijvxronqy` (según tus API keys)
- Tu URL será: `jdbc:postgresql://db.ijjskcroggxijvxronqy.supabase.co:5432/postgres?sslmode=require`
- Username: `postgres`
- Password: El que configuraste en Supabase (ve a Project Settings → Database)

## 🏃 Paso 2: Ejecutar el Backend

### Opción A: Con Maven (Recomendado)

Abre una terminal en la carpeta `backend` y ejecuta:

```bash
cd backend
mvn spring-boot:run
```

### Opción B: Con Maven Wrapper (Windows)

```bash
cd backend
.\mvnw.cmd spring-boot:run
```

### Opción C: Compilar y Ejecutar el JAR

```bash
cd backend
mvn clean package
java -jar target/prestacol-backend-1.0.0.jar
```

## ✅ Paso 3: Verificar que Está Funcionando

Cuando el backend inicie correctamente, verás algo como:

```
Started PrestacolApplication in X.XXX seconds
```

### Probar el Backend:

1. **Health Check** (sin autenticación):
   ```
   GET http://localhost:8080/api/public/health
   ```

2. **Registrar un usuario**:
   ```
   POST http://localhost:8080/api/auth/register
   Content-Type: application/json
   
   {
     "email": "test@example.com",
     "password": "password123",
     "nombreCompleto": "Usuario Test",
     "telefono": "1234567890",
     "rol": "PRESTAMISTA",
     "tipoSuscripcion": "MENSUAL"
   }
   ```

## 🐛 Solución de Problemas

### Error: "Connection refused" o "Connection timeout"
- Verifica que la URL de Supabase sea correcta
- Verifica que el password sea correcto
- Asegúrate de usar `?sslmode=require` en la URL

### Error: "Port 8080 already in use"
- Cambia el puerto en `application.yml`:
  ```yaml
  server:
    port: 8081
  ```

### Error: "Java version not found"
- Instala Java 17 desde: https://www.oracle.com/java/technologies/downloads/#java17
- Verifica con: `java -version` (debe mostrar versión 17 o superior)

### Error: "Maven not found"
- Instala Maven desde: https://maven.apache.org/download.cgi
- O usa el wrapper: `.\mvnw.cmd` (Windows) o `./mvnw` (Linux/Mac)

## 📝 Notas Importantes

- El backend se ejecuta en: **http://localhost:8080/api**
- El frontend debe apuntar a esta URL
- El JWT secret está configurado en `application.yml` (cámbialo en producción)
- Los logs se muestran en la consola

## 🎯 Próximos Pasos

1. ✅ Backend ejecutándose
2. ⏭️ Configurar el frontend para conectarse al backend
3. ⏭️ Probar todas las funcionalidades

---

**¿Necesitas ayuda?** Revisa los logs del backend para ver errores específicos.

