# 🎯 Configuración Rápida - Supabase → Spring Boot

## ✅ Ya tienes toda la información necesaria

Basado en tu proyecto Supabase (`ijjskcroggxijvxronqy`), aquí está la configuración completa:

## 📝 Configuración para application.yml

Abre `backend/src/main/resources/application.yml` y cambia la sección `datasource`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://db.ijjskcroggxijvxronqy.supabase.co:5432/postgres?sslmode=require
    username: postgres
    password: TU_PASSWORD_AQUI  # ← Obtén este password haciendo clic en "Restablecer contraseña"
```

## 🔑 Cómo obtener el password

1. **En la página que estás viendo** (Project Settings → Database)
2. **Haz clic en "Restablecer contraseña de la base de datos"**
3. **Copia el nuevo password** que te muestre
4. **Pégalo en el `application.yml`**

## 📋 Resumen de valores

| Campo | Valor |
|-------|-------|
| **URL JDBC** | `jdbc:postgresql://db.ijjskcroggxijvxronqy.supabase.co:5432/postgres?sslmode=require` |
| **Username** | `postgres` |
| **Password** | (Resetea y copia el nuevo) |
| **Puerto** | `5432` |
| **Database** | `postgres` |
| **SSL** | `require` (ya incluido en la URL) |

## ⚠️ Notas importantes

1. **SSL requerido**: La URL ya incluye `?sslmode=require` (necesario para Supabase)
2. **Pool size**: Supabase tiene un límite de 15 conexiones por defecto (suficiente para desarrollo)
3. **Restricciones IP**: Por ahora está permitido desde todas las IPs (perfecto para desarrollo)

## 🚀 Después de configurar

1. Guarda el archivo `application.yml`
2. Ejecuta el backend:
   ```bash
   cd backend
   mvn spring-boot:run
   ```

## ✅ Verificación

Si todo está bien, verás:
```
Started PrestacolApplication in X.XXX seconds
```

Si hay error de conexión, verifica:
- ✅ El password es correcto
- ✅ La URL tiene `db.` al inicio
- ✅ La URL tiene `?sslmode=require` al final

---

**¿Listo?** Resetea el password, cópialo, pégalo en `application.yml` y ejecuta el backend.

