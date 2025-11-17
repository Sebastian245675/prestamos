package com.prestamos.controller;

import com.prestamos.dto.AuthResponse;
import com.prestamos.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class PaymentController {
    
    private final AuthService authService;
    
    /**
     * Confirma el pago y completa el registro
     */
    @PostMapping("/confirm")
    public ResponseEntity<?> confirmarPago(@RequestParam String orderId) {
        try {
            log.info("Confirmando pago para orden: {}", orderId);
            AuthResponse response = authService.completarRegistro(orderId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error al confirmar pago: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", true, "message", e.getMessage()));
        }
    }
    
    /**
     * Verifica el estado de una orden de pago
     */
    @GetMapping("/status/{orderId}")
    public ResponseEntity<?> verificarEstado(@PathVariable String orderId) {
        try {
            // Aquí podrías agregar lógica para verificar el estado en PayPal
            Map<String, Object> response = new HashMap<>();
            response.put("orderId", orderId);
            response.put("status", "PENDING"); // Por ahora retornamos PENDING
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error al verificar estado: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", true, "message", e.getMessage()));
        }
    }
}

