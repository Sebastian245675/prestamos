package com.prestamos.controller;

import com.prestamos.config.SecurityUtils;
import com.prestamos.entity.Suscripcion;
import com.prestamos.service.SuscripcionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/suscripciones")
@RequiredArgsConstructor
@Slf4j
public class SuscripcionController {
    
    private final SuscripcionService suscripcionService;
    private final SecurityUtils securityUtils;
    
    @GetMapping
    public ResponseEntity<?> obtenerSuscripcion() {
        try {
            Long usuarioId = securityUtils.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));
            
            Optional<Suscripcion> suscripcionOpt = suscripcionService.obtenerSuscripcionActiva(usuarioId);
            
            if (suscripcionOpt.isEmpty()) {
                // Si no hay suscripción activa, buscar la última
                suscripcionOpt = suscripcionService.obtenerUltimaSuscripcion(usuarioId);
            }
            
            if (suscripcionOpt.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "No se encontró suscripción");
                response.put("tipo", null);
                response.put("estado", "SIN_SUSCRIPCION");
                return ResponseEntity.ok(response);
            }
            
            Suscripcion suscripcion = suscripcionOpt.get();
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", suscripcion.getId());
            response.put("tipo", suscripcion.getTipo().toString());
            response.put("monto", suscripcion.getMonto());
            response.put("fechaInicio", suscripcion.getFechaInicio().toString());
            response.put("fechaVencimiento", suscripcion.getFechaVencimiento().toString());
            response.put("estado", suscripcion.getEstado().toString());
            
            // Convertir monto a COP para mostrar (asumiendo que está en USD)
            // 1 USD ≈ 4000 COP
            java.math.BigDecimal montoCOP = suscripcion.getMonto().multiply(new java.math.BigDecimal("4000"));
            response.put("montoCOP", montoCOP);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error al obtener suscripción: {}", e.getMessage(), e);
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Error al obtener suscripción");
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}

