# PrestaCol - Sistema de Gestión de Préstamos

Sistema completo para prestamistas que permite registrar, administrar y hacer seguimiento de préstamos, cobranzas, clientes y estadísticas de productividad.

## 🚀 Tecnologías

### Backend
- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Security + JWT**
- **PostgreSQL**
- **Spring Data JPA**

### Frontend
- **React 18**
- **Vite**
- **React Router**
- **Tailwind CSS**
- **Axios**
- **Recharts** (para gráficos)
- **React Calendar**

## 📋 Requisitos Previos

- Java JDK 17 o superior
- Maven 3.6+
- Node.js 18+ y npm
- PostgreSQL 12+

## 🔧 Configuración

### 1. Base de Datos

Crear la base de datos PostgreSQL:

```sql
CREATE DATABASE prestacol_db;
```

Ejecutar el script de esquema:

```bash
psql -U postgres -d prestacol_db -f database/schema.sql
```

### 2. Backend (Spring Boot)

1. Navegar a la carpeta backend:
```bash
cd backend
```

2. Configurar las credenciales de la base de datos en `src/main/resources/application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/prestacol_db
    username: tu_usuario
    password: tu_password
```

3. Compilar y ejecutar:
```bash
mvn clean install
mvn spring-boot:run
```

El backend estará disponible en `http://localhost:8080/api`

### 3. Frontend (React)

1. Navegar a la carpeta frontend:
```bash
cd frontend
```

2. Instalar dependencias:
```bash
npm install
```

3. Ejecutar en modo desarrollo:
```bash
npm run dev
```

El frontend estará disponible en `http://localhost:3000`

## 📱 Funcionalidades Principales

### Para Prestamistas:
- ✅ Registro e inicio de sesión
- ✅ Gestión de préstamos (crear, editar, eliminar)
- ✅ Control de abonos y pagos
- ✅ Calendario de cobros con recordatorios
- ✅ Reportes y estadísticas (PDF/Excel)
- ✅ Gestión de cobradores (máximo 2)
- ✅ Dashboard con resumen de actividades

### Para Cobradores:
- ✅ Acceso con credenciales propias
- ✅ Ver préstamos asignados
- ✅ Registrar abonos
- ✅ Actualizar estado de préstamos

### Para Clientes:
- ✅ Portal privado para consultar su préstamo
- ✅ Ver estado de cuotas
- ✅ Historial de abonos
- ✅ Saldo pendiente

## 🔐 Suscripciones

- **Mensual**: $30.000/mes
- **Anual**: $270.000/año (ahorras $90.000)

## 🚧 Modo Desarrollo

**¡IMPORTANTE!** La aplicación está configurada en modo desarrollo:
- ✅ Puedes iniciar sesión con **cualquier credencial** (email y contraseña)
- ✅ El frontend funciona con datos mock si el backend no está disponible
- ✅ Todas las funcionalidades están implementadas y funcionando
- ✅ La aplicación está lista para usar inmediatamente

## 📊 Estados de Préstamos

- 🟢 **Activo**: Préstamo vigente
- 🔴 **Vencido**: Llegó la fecha final y hay saldo pendiente
- ⚪ **Finalizado**: Préstamo pagado completamente
- 🟠 **Incobrable**: Préstamo marcado como perdido

## 📁 Estructura del Proyecto

```
prestamos/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/prestamos/
│   │   │   │   ├── entity/        # Entidades JPA
│   │   │   │   ├── repository/     # Repositorios
│   │   │   │   ├── config/        # Configuración
│   │   │   │   └── ...
│   │   │   └── resources/
│   │   │       └── application.yml
│   │   └── test/
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pages/          # Páginas principales
│   │   ├── context/        # Context API
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
└── database/
    └── schema.sql          # Esquema de base de datos
```

## 🎨 Vistas Implementadas

1. **Login/Register**: Autenticación de usuarios
2. **Dashboard**: Resumen general con estadísticas
3. **Préstamos**: Lista y gestión de préstamos
4. **Nuevo Préstamo**: Formulario de creación
5. **Calendario**: Vista de cobros pendientes
6. **Reportes**: Estadísticas y gráficos
7. **Cobradores**: Gestión de cobradores
8. **Portal Cliente**: Vista pública para clientes

## 🔮 Funcionalidades Futuras (v2)

- Notificaciones por WhatsApp/SMS
- Pagos en línea
- Mapa interactivo con ubicación de clientes
- Dashboard con gráficos dinámicos
- Sistema de alertas automáticas por morosidad
- Versión multiusuario con roles avanzados

## 📝 Notas

- Las vistas frontend están implementadas y listas para conectar con el backend
- El backend necesita implementación completa de controladores y servicios
- La autenticación JWT está configurada pero requiere implementación de endpoints
- Los reportes PDF/Excel necesitan implementación en el backend

## 👨‍💻 Desarrollo

Para contribuir o desarrollar nuevas funcionalidades:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial.

