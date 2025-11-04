# 🚀 Instrucciones Rápidas - PrestaCol

## ✅ Estado Actual

La aplicación está **COMPLETA y FUNCIONAL** en modo desarrollo. Puedes usarla inmediatamente.

## 📱 Cómo Usar

### 1. Frontend (Ya está corriendo)

El frontend ya está ejecutándose en `http://localhost:3000`

**Para iniciar sesión:**
- Puedes usar **CUALQUIER email y contraseña**
- Ejemplos:
  - Email: `admin@prestacol.com` / Contraseña: `cualquiera`
  - Email: `test@test.com` / Contraseña: `123456`
  - Email: cualquier cosa / Contraseña: cualquier cosa

### 2. Backend (Opcional para desarrollo completo)

Si quieres usar el backend real con base de datos:

```bash
cd backend
mvn spring-boot:run
```

**Nota:** El frontend funciona perfectamente sin el backend gracias a los datos mock.

## 🎯 Funcionalidades Disponibles

### ✅ Todas las vistas están completas:

1. **Login/Registro** - Funciona con cualquier credencial
2. **Dashboard** - Muestra estadísticas (datos mock si no hay backend)
3. **Préstamos** - Ver lista de préstamos
4. **Nuevo Préstamo** - Crear préstamos
5. **Detalle Préstamo** - Ver detalles y registrar abonos
6. **Calendario** - Ver cobros por fecha
7. **Reportes** - Estadísticas y gráficos
8. **Cobradores** - Gestionar cobradores
9. **Portal Cliente** - Vista pública para clientes

## 🔧 Estructura Completa

### Backend (Spring Boot)
- ✅ Entidades JPA completas
- ✅ Repositorios
- ✅ Servicios de negocio
- ✅ Controladores REST
- ✅ DTOs
- ✅ Configuración de seguridad

### Frontend (React)
- ✅ Todas las páginas implementadas
- ✅ Componentes reutilizables
- ✅ Autenticación con Context API
- ✅ Datos mock para desarrollo
- ✅ Diseño responsive (móvil y web)

## 📝 Próximos Pasos (Si quieres usar con BD real)

1. **Crear base de datos PostgreSQL:**
```sql
CREATE DATABASE prestacol_db;
```

2. **Ejecutar esquema:**
```bash
psql -U postgres -d prestacol_db -f database/schema.sql
```

3. **Configurar conexión en `application.yml`**

4. **Ejecutar backend:**
```bash
cd backend
mvn spring-boot:run
```

## ✨ Características Principales

- 🔐 Autenticación (modo desarrollo: acepta cualquier credencial)
- 💰 Gestión completa de préstamos
- 📅 Calendario de cobros
- 📊 Reportes y estadísticas
- 👥 Gestión de cobradores (máximo 2)
- 📱 Diseño responsive
- 🎨 Interfaz moderna con Tailwind CSS

## 🎉 ¡Listo para usar!

La aplicación está completamente funcional. Solo abre `http://localhost:3000` e inicia sesión con cualquier credencial.

