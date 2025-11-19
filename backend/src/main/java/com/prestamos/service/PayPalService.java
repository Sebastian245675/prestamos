package com.prestamos.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PayPalService {
    
    @Value("${paypal.client-id}")
    private String clientId;
    
    @Value("${paypal.client-secret}")
    private String clientSecret;
    
    @Value("${paypal.mode:sandbox}")
    private String mode;
    
    @Value("${paypal.base-url}")
    private String baseUrl;
    
    @Value("${paypal.return-url}")
    private String returnUrl;
    
    @Value("${paypal.cancel-url}")
    private String cancelUrl;
    
    @Value("${paypal.subscription.mensual.precio:40000}")
    private BigDecimal precioMensual;
    
    @Value("${paypal.subscription.anual.precio:432000}")
    private BigDecimal precioAnual;
    
    @Value("${paypal.subscription.mensual.currency:COP}")
    private String currency;
    
    private final RestTemplate restTemplate = new RestTemplate();
    
    /**
     * Obtiene el token de acceso de PayPal
     */
    private String getAccessToken() {
        try {
            String url = baseUrl + "/v1/oauth2/token";
            
            // Validar que las credenciales no estén vacías
            if (clientId == null || clientId.trim().isEmpty()) {
                throw new RuntimeException("PayPal Client ID no está configurado");
            }
            if (clientSecret == null || clientSecret.trim().isEmpty()) {
                throw new RuntimeException("PayPal Client Secret no está configurado");
            }
            
            // Limpiar espacios en las credenciales
            String cleanClientId = clientId.trim().replaceAll("\\s+", "");
            String cleanClientSecret = clientSecret.trim().replaceAll("\\s+", "");
            
            log.info("=== INTENTANDO OBTENER TOKEN DE PAYPAL ===");
            log.info("URL: {}", url);
            log.info("Client ID completo: {}", cleanClientId);
            log.info("Client ID longitud: {} caracteres", cleanClientId.length());
            log.info("Client Secret longitud: {} caracteres", cleanClientSecret.length());
            log.info("Client Secret (primeros 10): {}", cleanClientSecret.length() > 10 ? cleanClientSecret.substring(0, 10) + "..." : cleanClientSecret);
            log.info("Base URL configurada: {}", baseUrl);
            log.info("Modo: {}", mode);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.setBasicAuth(cleanClientId, cleanClientSecret);
            
            log.info("Headers configurados. Content-Type: {}", headers.getContentType());
            log.info("Authorization header presente: {}", headers.get("Authorization") != null);
            
            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("grant_type", "client_credentials");
            
            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
            
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(url, HttpMethod.POST, request, new ParameterizedTypeReference<Map<String, Object>>() {});
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                String accessToken = (String) response.getBody().get("access_token");
                if (accessToken != null) {
                    log.info("Token de acceso de PayPal obtenido exitosamente");
                    return accessToken;
                }
            }
            
            // Si llegamos aquí, hubo un error
            String errorMessage = "No se pudo obtener el token de acceso de PayPal. Status: " + response.getStatusCode();
            if (response.getBody() != null) {
                errorMessage += ", Body: " + response.getBody();
            }
            log.error(errorMessage);
            throw new RuntimeException(errorMessage);
            
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            String errorMessage = "Error HTTP al obtener token de PayPal: " + e.getStatusCode();
            String responseBody = e.getResponseBodyAsString();
            if (responseBody != null && !responseBody.isEmpty()) {
                errorMessage += " - " + responseBody;
                log.error("Respuesta completa de PayPal: {}", responseBody);
            } else {
                errorMessage += " - [no body]";
            }
            log.error("=== DETALLES DEL ERROR ===");
            log.error("Status Code: {}", e.getStatusCode());
            log.error("Status Text: {}", e.getStatusText());
            log.error("Response Headers: {}", e.getResponseHeaders());
            log.error("Mensaje completo: {}", errorMessage);
            throw new RuntimeException("Error al conectar con PayPal: " + errorMessage);
        } catch (Exception e) {
            log.error("Error al obtener token de acceso de PayPal: {}", e.getMessage(), e);
            throw new RuntimeException("Error al conectar con PayPal: " + e.getMessage());
        }
    }
    
    /**
     * Crea una orden de pago en PayPal
     */
    public Map<String, Object> createOrder(String tipoSuscripcion, String email, String nombreCompleto) {
        try {
            String accessToken = getAccessToken();
            String url = baseUrl + "/v2/checkout/orders";
            
            BigDecimal precio = tipoSuscripcion.equals("MENSUAL") ? precioMensual : precioAnual;
            String descripcion = tipoSuscripcion.equals("MENSUAL") 
                ? "Suscripción Mensual - PrestaCol" 
                : "Suscripción Anual - PrestaCol";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(accessToken);
            headers.set("PayPal-Request-Id", java.util.UUID.randomUUID().toString());
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("intent", "CAPTURE");
            
            Map<String, Object> purchaseUnit = new HashMap<>();
            purchaseUnit.put("reference_id", "SUB-" + java.util.UUID.randomUUID().toString());
            purchaseUnit.put("description", descripcion);
            
            Map<String, Object> amount = new HashMap<>();
            amount.put("currency_code", currency);
            amount.put("value", precio.toString());
            purchaseUnit.put("amount", amount);
            
            // PayPal no requiere el objeto payer en la creación de la orden
            // El email y nombre se capturan cuando el usuario inicia sesión en PayPal
            // Solo incluimos el email_address si es necesario, pero generalmente no es requerido
            Map<String, Object> payer = new HashMap<>();
            payer.put("email_address", email);
            
            requestBody.put("purchase_units", java.util.Arrays.asList(purchaseUnit));
            requestBody.put("payer", payer);
            
            // PayPal agregará el token automáticamente en la URL de retorno
            Map<String, Object> applicationContext = new HashMap<>();
            applicationContext.put("return_url", returnUrl);
            applicationContext.put("cancel_url", cancelUrl);
            applicationContext.put("brand_name", "PrestaCol");
            applicationContext.put("locale", "es-CO");
            applicationContext.put("landing_page", "BILLING");
            applicationContext.put("user_action", "PAY_NOW");
            
            requestBody.put("application_context", applicationContext);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(url, HttpMethod.POST, request, new ParameterizedTypeReference<Map<String, Object>>() {});
            
            if (response.getStatusCode() == HttpStatus.CREATED && response.getBody() != null) {
                Map<String, Object> order = (Map<String, Object>) response.getBody();
                String orderId = (String) order.get("id");
                
                // Obtener el link de aprobación
                java.util.List<Map<String, Object>> links = (java.util.List<Map<String, Object>>) order.get("links");
                String approvalUrl = links.stream()
                    .filter(link -> "approve".equals(link.get("rel")))
                    .map(link -> (String) link.get("href"))
                    .findFirst()
                    .orElse(null);
                
                Map<String, Object> result = new HashMap<>();
                result.put("orderId", orderId);
                result.put("approvalUrl", approvalUrl);
                result.put("status", order.get("status"));
                result.put("precio", precio);
                result.put("tipoSuscripcion", tipoSuscripcion);
                
                log.info("Orden de pago creada en PayPal: {} para usuario: {}", orderId, email);
                
                return result;
            }
            
            throw new RuntimeException("No se pudo crear la orden de pago en PayPal");
            
        } catch (Exception e) {
            log.error("Error al crear orden de pago en PayPal: {}", e.getMessage(), e);
            throw new RuntimeException("Error al crear orden de pago: " + e.getMessage());
        }
    }
    
    /**
     * Captura el pago de una orden
     */
    public Map<String, Object> captureOrder(String orderId) {
        try {
            String accessToken = getAccessToken();
            String url = baseUrl + "/v2/checkout/orders/" + orderId + "/capture";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(accessToken);
            
            HttpEntity<Void> request = new HttpEntity<>(headers);
            
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(url, HttpMethod.POST, request, new ParameterizedTypeReference<Map<String, Object>>() {});
            
            if (response.getStatusCode() == HttpStatus.CREATED && response.getBody() != null) {
                Map<String, Object> order = (Map<String, Object>) response.getBody();
                String orderStatus = (String) order.get("status");
                
                if ("COMPLETED".equals(orderStatus)) {
                    // Obtener información del pago
                    java.util.List<Map<String, Object>> purchaseUnits = 
                        (java.util.List<Map<String, Object>>) order.get("purchase_units");
                    
                    if (purchaseUnits != null && !purchaseUnits.isEmpty()) {
                        Map<String, Object> purchaseUnit = purchaseUnits.get(0);
                        Map<String, Object> payments = (Map<String, Object>) purchaseUnit.get("payments");
                        
                        if (payments != null) {
                            java.util.List<Map<String, Object>> captures = 
                                (java.util.List<Map<String, Object>>) payments.get("captures");
                            
                            if (captures != null && !captures.isEmpty()) {
                                Map<String, Object> capture = captures.get(0);
                                String captureId = (String) capture.get("id");
                                Map<String, Object> amount = (Map<String, Object>) capture.get("amount");
                                
                                Map<String, Object> result = new HashMap<>();
                                result.put("orderId", orderId);
                                result.put("captureId", captureId);
                                result.put("status", orderStatus);
                                result.put("amount", amount);
                                
                                log.info("Pago capturado exitosamente. Order ID: {}, Capture ID: {}", orderId, captureId);
                                
                                return result;
                            }
                        }
                    }
                }
                
                throw new RuntimeException("El pago no se completó. Estado: " + orderStatus);
            }
            
            // Si llegamos aquí, no se pudo capturar
            throw new RuntimeException("No se pudo capturar el pago");
            
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            // Si la orden ya fue capturada, PayPal retornará un error
            // Verificar el estado de la orden
            if (e.getStatusCode() == HttpStatus.UNPROCESSABLE_ENTITY) {
                log.warn("Orden {} puede estar ya capturada. Verificando estado...", orderId);
                try {
                    Map<String, Object> orderStatusMap = getOrderStatus(orderId);
                    String orderStatusValue = (String) orderStatusMap.get("status");
                    if ("COMPLETED".equals(orderStatusValue)) {
                        // La orden ya está completada, obtener información de la captura
                        java.util.List<Map<String, Object>> purchaseUnits = 
                            (java.util.List<Map<String, Object>>) orderStatusMap.get("purchase_units");
                        if (purchaseUnits != null && !purchaseUnits.isEmpty()) {
                            Map<String, Object> purchaseUnit = purchaseUnits.get(0);
                            Map<String, Object> payments = (Map<String, Object>) purchaseUnit.get("payments");
                            if (payments != null) {
                                java.util.List<Map<String, Object>> captures = 
                                    (java.util.List<Map<String, Object>>) payments.get("captures");
                                if (captures != null && !captures.isEmpty()) {
                                    Map<String, Object> capture = captures.get(0);
                                    String captureId = (String) capture.get("id");
                                    Map<String, Object> amount = (Map<String, Object>) capture.get("amount");
                                    
                                    Map<String, Object> result = new HashMap<>();
                                    result.put("orderId", orderId);
                                    result.put("captureId", captureId);
                                    result.put("status", orderStatusValue);
                                    result.put("amount", amount);
                                    
                                    log.info("Orden {} ya estaba capturada. Capture ID: {}", orderId, captureId);
                                    return result;
                                }
                            }
                        }
                    }
                } catch (Exception ex) {
                    log.error("Error al verificar estado de orden ya capturada: {}", ex.getMessage());
                }
            }
            log.error("Error HTTP al capturar orden de pago en PayPal: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Error al capturar el pago: " + e.getMessage());
        } catch (Exception e) {
            log.error("Error al capturar orden de pago en PayPal: {}", e.getMessage(), e);
            throw new RuntimeException("Error al capturar el pago: " + e.getMessage());
        }
    }
    
    /**
     * Obtiene el estado de una orden
     */
    public Map<String, Object> getOrderStatus(String orderId) {
        try {
            String accessToken = getAccessToken();
            String url = baseUrl + "/v2/checkout/orders/" + orderId;
            
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            
            HttpEntity<Void> request = new HttpEntity<>(headers);
            
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(url, HttpMethod.GET, request, new ParameterizedTypeReference<Map<String, Object>>() {});
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return (Map<String, Object>) response.getBody();
            }
            
            throw new RuntimeException("No se pudo obtener el estado de la orden");
            
        } catch (Exception e) {
            log.error("Error al obtener estado de orden de PayPal: {}", e.getMessage(), e);
            throw new RuntimeException("Error al obtener estado de la orden: " + e.getMessage());
        }
    }
    
    /**
     * Obtiene el precio según el tipo de suscripción
     */
    public BigDecimal getPrecioSuscripcion(String tipoSuscripcion) {
        return tipoSuscripcion.equals("MENSUAL") ? precioMensual : precioAnual;
    }
}

