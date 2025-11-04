package com.prestamos.controller;

import com.prestamos.config.SecurityUtils;
import com.prestamos.entity.Referido;
import com.prestamos.service.ReferidoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<?> obtenerCodigoReferido() {
        try {
            Long userId = securityUtils.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));
            
            String codigo = referidoService.obtenerCodigoReferido(userId);
            
            Map<String, String> response = new HashMap<>();
            response.put("codigo", codigo);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error al obtener código de referido: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", true, "message", "Error al obtener código de referido"));
        }
    }
    
    @GetMapping
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
                    data.put("nombre", ref.getReferido().getNombreCompleto());
                    data.put("email", ref.getReferido().getEmail());
                    data.put("fechaRegistro", ref.getFechaRegistro().toString());
                    data.put("estado", ref.getActivo() ? "ACTIVO" : "INACTIVO");
                    data.put("montoGenerado", ref.getMontoGenerado());
                    
                    // Calcular recompensa (5% del monto generado)
                    java.math.BigDecimal recompensa = ref.getMontoGenerado().multiply(new java.math.BigDecimal("0.05"));
                    data.put("recompensa", recompensa);
                    data.put("estadoRecompensa", ref.getMontoGenerado().compareTo(java.math.BigDecimal.ZERO) > 0 ? "PENDIENTE" : "PENDIENTE");
                    
                    return data;
                })
                .toList();
            
            return ResponseEntity.ok(referidosData);
            
        } catch (Exception e) {
            log.error("Error al obtener referidos: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", true, "message", "Error al obtener referidos"));
        }
    }
    
    @GetMapping("/recompensas")
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
            long activos = referidos.stream().filter(Referido::getActivo).count();
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
            log.error("Error al obtener recompensas: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", true, "message", "Error al obtener recompensas"));
        }
    }
    
    @GetMapping("/estadisticas")
    public ResponseEntity<?> obtenerEstadisticas() {
        try {
            Long userId = securityUtils.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));
            
            Map<String, Object> stats = referidoService.obtenerEstadisticas(userId);
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            log.error("Error al obtener estadísticas: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", true, "message", "Error al obtener estadísticas"));
        }
    }
}

