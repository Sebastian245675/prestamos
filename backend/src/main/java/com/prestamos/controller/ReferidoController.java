package com.prestamos.controller;

import com.prestamos.config.SecurityUtils;
import com.prestamos.entity.Referido;
import com.prestamos.service.ReferidoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/referidos")
@RequiredArgsConstructor
@Slf4j
public class ReferidoController {
    
    private final ReferidoService referidoService;
    private final SecurityUtils securityUtils;
    
    @GetMapping("/codigo")
    @Transactional
    public ResponseEntity<?> obtenerCodigoReferido() {
        try {
            Long userId = securityUtils.getCurrentUserId()
                .orElseThrow(() -> {
                    log.error("Usuario no autenticado al intentar obtener código de referido");
                    return new RuntimeException("Usuario no autenticado");
                });
            
            log.debug("Obteniendo código de referido para usuario ID: {}", userId);
            String codigo = referidoService.obtenerCodigoReferido(userId);
            
            if (codigo == null || codigo.trim().isEmpty()) {
                log.error("El código de referido está vacío para usuario ID: {}", userId);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", true, "message", "Error al generar código de referido"));
            }
            
            Map<String, String> response = new HashMap<>();
            response.put("codigo", codigo);
            
            log.debug("Código de referido obtenido exitosamente para usuario ID: {} - Código: {}", userId, codigo);
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Error al obtener código de referido: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", true, "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error inesperado al obtener código de referido: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", true, "message", "Error al obtener código de referido: " + e.getMessage()));
        }
    }
    
    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<?> obtenerReferidos() {
        try {
            Long userId = securityUtils.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));
            
            List<Referido> referidos = referidoService.obtenerReferidos(userId);
            
            // Mapear a formato esperado por el frontend
            List<Map<String, Object>> referidosData = referidos.stream()
                .map(ref -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("id", ref.getId());
                    
                    // Validar que el referido no sea null
                    if (ref.getReferido() != null) {
                        data.put("nombre", ref.getReferido().getNombreCompleto());
                        data.put("email", ref.getReferido().getEmail());
                    } else {
                        data.put("nombre", "N/A");
                        data.put("email", "N/A");
                        log.warn("Referido con ID {} tiene referencia null", ref.getId());
                    }
                    
                    data.put("fechaRegistro", ref.getFechaRegistro() != null ? ref.getFechaRegistro().toString() : "");
                    data.put("estado", ref.getActivo() != null && ref.getActivo() ? "ACTIVO" : "INACTIVO");
                    data.put("montoGenerado", ref.getMontoGenerado() != null ? ref.getMontoGenerado() : java.math.BigDecimal.ZERO);
                    
                    // Calcular recompensa (5% del monto generado)
                    java.math.BigDecimal monto = ref.getMontoGenerado() != null ? ref.getMontoGenerado() : java.math.BigDecimal.ZERO;
                    java.math.BigDecimal recompensa = monto.multiply(new java.math.BigDecimal("0.05"));
                    data.put("recompensa", recompensa);
                    data.put("estadoRecompensa", monto.compareTo(java.math.BigDecimal.ZERO) > 0 ? "PENDIENTE" : "PENDIENTE");
                    
                    return data;
                })
                .toList();
            
            return ResponseEntity.ok(referidosData);
            
        } catch (Exception e) {
            log.error("Error al obtener referidos: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", true, "message", "Error al obtener referidos: " + e.getMessage()));
        }
    }
    
    @GetMapping("/recompensas")
    @Transactional(readOnly = true)
    public ResponseEntity<?> obtenerRecompensas() {
        try {
            Long userId = securityUtils.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));
            
            List<Referido> referidos = referidoService.obtenerReferidos(userId);
            
            // Generar lista de recompensas
            java.util.List<Map<String, Object>> recompensas = new java.util.ArrayList<>();
            
            // Primer referido
            if (referidos.size() >= 1) {
                Map<String, Object> primera = new HashMap<>();
                primera.put("id", 1);
                primera.put("tipo", "PRIMER_REFERIDO");
                primera.put("descripcion", "Por tu primer referido");
                primera.put("monto", 50000);
                primera.put("estado", referidos.size() >= 1 ? "DISPONIBLE" : "PENDIENTE");
                primera.put("fecha", null);
                recompensas.add(primera);
            }
            
            // Referidos activos
            long activos = referidos.stream()
                .filter(r -> r.getActivo() != null && r.getActivo())
                .count();
            if (activos > 0) {
                Map<String, Object> activa = new HashMap<>();
                activa.put("id", 2);
                activa.put("tipo", "REFERIDO_ACTIVO");
                activa.put("descripcion", "Por cada referido activo con préstamo");
                activa.put("monto", activos * 100000);
                activa.put("estado", "DISPONIBLE");
                activa.put("fecha", null);
                recompensas.add(activa);
            }
            
            // 5% del monto generado
            java.math.BigDecimal montoTotal = referidos.stream()
                .map(Referido::getMontoGenerado)
                .filter(m -> m != null)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
            
            if (montoTotal.compareTo(java.math.BigDecimal.ZERO) > 0) {
                Map<String, Object> porcentaje = new HashMap<>();
                porcentaje.put("id", 3);
                porcentaje.put("tipo", "MONTO_GENERADO");
                porcentaje.put("descripcion", "5% del monto generado por referidos");
                porcentaje.put("monto", montoTotal.multiply(new java.math.BigDecimal("0.05")).doubleValue());
                porcentaje.put("estado", "PENDIENTE");
                porcentaje.put("fecha", null);
                recompensas.add(porcentaje);
            }
            
            // Bonus mensual
            if (activos >= 5) {
                Map<String, Object> bonus = new HashMap<>();
                bonus.put("id", 4);
                bonus.put("tipo", "BONUS_MENSUAL");
                bonus.put("descripcion", "Bonus mensual por 5+ referidos activos");
                bonus.put("monto", 200000);
                bonus.put("estado", "DISPONIBLE");
                bonus.put("fecha", null);
                recompensas.add(bonus);
            }
            
            return ResponseEntity.ok(recompensas);
            
        } catch (Exception e) {
            log.error("Error al obtener recompensas: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", true, "message", "Error al obtener recompensas: " + e.getMessage()));
        }
    }
    
    @GetMapping("/estadisticas")
    @Transactional(readOnly = true)
    public ResponseEntity<?> obtenerEstadisticas() {
        try {
            Long userId = securityUtils.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));
            
            Map<String, Object> stats = referidoService.obtenerEstadisticas(userId);
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            log.error("Error al obtener estadísticas: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", true, "message", "Error al obtener estadísticas: " + e.getMessage()));
        }
    }
}

