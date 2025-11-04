# Configuración de Supabase para PrestaCol

Este proyecto utiliza Supabase como backend (base de datos y autenticación). Aquí están las instrucciones para configurar todo.

## 1. Crear el proyecto en Supabase

1. Ve a [Supabase](https://supabase.com) y crea una cuenta o inicia sesión
2. Crea un nuevo proyecto
3. Anota tu URL del proyecto y las claves API

## 2. Configurar la base de datos

1. Ve al Editor SQL en tu proyecto de Supabase
2. Copia y pega el contenido de `database/supabase_schema.sql`
3. Ejecuta el script para crear todas las tablas, índices y políticas RLS

## 3. Configurar las claves API

Las claves ya están configuradas en `frontend/src/lib/supabase.js`, pero si necesitas cambiarlas:

1. Ve a Settings > API en tu proyecto de Supabase
2. Copia la URL del proyecto y la clave anon public
3. Actualiza `frontend/src/lib/supabase.js` con tus credenciales

## 4. Instalar dependencias

Asegúrate de tener instalado `@supabase/supabase-js`:

```bash
cd frontend
npm install @supabase/supabase-js
```

## 5. Configurar autenticación

1. Ve a Authentication > Settings en Supabase
2. Asegúrate de que "Enable email signup" esté activado
3. Opcionalmente configura el dominio de redirección para producción

## 6. Desactivar confirmación de email (modo desarrollo)

Para desarrollo rápido, puedes desactivar la confirmación de email:

1. Ve a Authentication > Settings
2. Desactiva "Enable email confirmations"

**⚠️ IMPORTANTE:** En producción, siempre activa la confirmación de email.

## 7. Verificar configuración

1. Ejecuta el frontend: `npm run dev`
2. Intenta registrarte con una nueva cuenta
3. Verifica que puedas iniciar sesión

## Troubleshooting

### Error: "relation does not exist"
- Asegúrate de haber ejecutado el script SQL completo
- Verifica que todas las tablas se crearon correctamente en el SQL Editor

### Error: "new row violates row-level security policy"
- Verifica que las políticas RLS estén creadas correctamente
- Asegúrate de estar autenticado antes de hacer operaciones

### Error: "permission denied for table"
- Verifica que las políticas RLS permitan la operación
- Verifica que el usuario esté autenticado correctamente

## Estructura de datos

El sistema usa las siguientes tablas:
- `usuarios`: Información de usuarios (prestamistas, cobradores)
- `prestamos`: Información de préstamos
- `abonos`: Registro de pagos/abonos
- `cuotas`: Cuotas individuales de cada préstamo
- `movimientos`: Entradas y salidas de dinero
- `suscripciones`: Suscripciones de los prestamistas

## Row Level Security (RLS)

Todas las tablas tienen RLS activado para seguridad:
- Los usuarios solo pueden ver/modificar sus propios datos
- Los prestamistas solo ven sus propios préstamos
- Los cobradores pueden ver préstamos asignados (implementar según necesidad)
