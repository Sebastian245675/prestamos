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
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.setBasicAuth(clientId, clientSecret);
            
            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("grant_type", "client_credentials");
            
            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
            
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(url, HttpMethod.POST, request, new ParameterizedTypeReference<Map<String, Object>>() {});
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return (String) response.getBody().get("access_token");
            }
            
            throw new RuntimeException("No se pudo obtener el token de acceso de PayPal");
            
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
            
            Map<String, Object> payer = new HashMap<>();
            payer.put("email_address", email);
            
            Map<String, Object> name = new HashMap<>();
            name.put("full_name", nombreCompleto);
            payer.put("name", name);
            
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
                String status = (String) order.get("status");
                
                if ("COMPLETED".equals(status)) {
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
                                result.put("status", status);
                                result.put("amount", amount);
                                
                                log.info("Pago capturado exitosamente. Order ID: {}, Capture ID: {}", orderId, captureId);
                                
                                return result;
                            }
                        }
                    }
                }
                
                throw new RuntimeException("El pago no se completó. Estado: " + status);
            }
            
            throw new RuntimeException("No se pudo capturar el pago");
            
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

