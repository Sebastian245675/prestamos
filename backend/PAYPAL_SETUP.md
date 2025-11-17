# Configuración de PayPal para Pagos de Suscripción

## Pasos para Obtener las Credenciales de API de PayPal

### 1. Iniciar Sesión en PayPal Developer
1. Ve a [https://developer.paypal.com/](https://developer.paypal.com/)
2. Inicia sesión con tu cuenta de PayPal Business (necesitas una cuenta de negocio)

### 2. Crear una Aplicación
1. Una vez dentro del dashboard, ve a **"My Apps & Credentials"** (Mis Apps y Credenciales)
2. Haz clic en **"Create App"** (Crear App)
3. Nombre de la aplicación: `PrestaCol - Sistema de Préstamos`
4. Tipo: Selecciona **"Merchant"** (Comerciante) o **"Marketplace"** según tu necesidad
5. Haz clic en **"Create App"**

### 3. Obtener las Credenciales
Después de crear la app, verás dos conjuntos de credenciales:

#### Credenciales de Sandbox (Para Pruebas)
- **Client ID**: Se usa para desarrollo y pruebas
- **Secret**: Se usa para desarrollo y pruebas
- Ambiente: Sandbox (https://api.sandbox.paypal.com)

#### Credenciales de Producción (Para Producción)
- **Client ID**: Se usa para pagos reales
- **Secret**: Se usa para pagos reales
- Ambiente: Live (https://api.paypal.com)

### 4. Configurar las Credenciales en el Backend

Agrega las credenciales en `application.yml`:

```yaml
paypal:
  client-id: TU_CLIENT_ID_AQUI
  client-secret: TU_CLIENT_SECRET_AQUI
  mode: sandbox  # Cambiar a 'live' para producción
  base-url: https://api.sandbox.paypal.com  # Cambiar a https://api.paypal.com para producción
```

### 5. Alternativa: Variables de Entorno (Recomendado para Producción)

Para mayor seguridad, usa variables de entorno:

```bash
# En Windows PowerShell
$env:PAYPAL_CLIENT_ID="tu_client_id"
$env:PAYPAL_CLIENT_SECRET="tu_client_secret"
$env:PAYPAL_MODE="sandbox"  # o "live" para producción
```

En Linux/Mac:
```bash
export PAYPAL_CLIENT_ID="tu_client_id"
export PAYPAL_CLIENT_SECRET="tu_client_secret"
export PAYPAL_MODE="sandbox"
```

### 6. Dónde Encontrar las Credenciales en PayPal

1. En el dashboard de PayPal Developer
2. Ve a **"My Apps & Credentials"**
3. Haz clic en el nombre de tu aplicación
4. Verás:
   - **Client ID**: Visible inmediatamente
   - **Secret**: Haz clic en "Show" para revelarlo

### 7. Configurar los Permisos de la API

Para suscripciones recurrentes, necesitas:
- **Subscription API** habilitada
- En tu cuenta de PayPal Business, verifica que tengas permisos para:
  - Crear y gestionar suscripciones
  - Procesar pagos recurrentes

### Notas Importantes

- **Sandbox**: Usa para pruebas sin dinero real
- **Producción**: Usa solo cuando estés listo para recibir pagos reales
- **Secreto**: Nunca compartas tu Secret públicamente
- **Variables de Entorno**: Siempre usa variables de entorno en producción
- **Webhooks**: Configura webhooks para recibir notificaciones de pagos

### Enlaces Útiles

- [PayPal Developer Dashboard](https://developer.paypal.com/dashboard)
- [PayPal Subscriptions API Documentation](https://developer.paypal.com/docs/subscriptions/)
- [PayPal REST API Reference](https://developer.paypal.com/docs/api/overview/)

