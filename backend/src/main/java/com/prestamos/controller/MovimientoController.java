package com.prestamos.controller;

import com.prestamos.config.SecurityUtils;
import com.prestamos.dto.MovimientoRequest;
import com.prestamos.entity.Movimiento;
import com.prestamos.service.MovimientoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/movimientos")
@RequiredArgsConstructor
@Slf4j
public class MovimientoController {
    
    private final MovimientoService movimientoService;
    private final SecurityUtils securityUtils;
    
    @PostMapping
    public ResponseEntity<?> crearMovimiento(@Valid @RequestBody MovimientoRequest request) {
        try {
            Long userId = securityUtils.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));
            
            Movimiento movimiento = movimientoService.crearMovimiento(userId, request);
            log.info("Movimiento creado: ID {} por usuario {}", movimiento.getId(), userId);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(movimiento);
        } catch (RuntimeException e) {
            log.error("Error al crear movimiento: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("error", true, "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error al crear movimiento: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", true, "message", "Error al crear movimiento"));
        }
    }
    
    @GetMapping
    public ResponseEntity<?> obtenerMovimientos(
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) String fechaDesde,
            @RequestParam(required = false) String fechaHasta) {
        try {
            Long userId = securityUtils.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));
            
            List<Movimiento> movimientos;
            
            if (fechaDesde != null && fechaHasta != null) {
                LocalDate inicio = LocalDate.parse(fechaDesde);
                LocalDate fin = LocalDate.parse(fechaHasta);
                movimientos = movimientoService.obtenerMovimientosPorUsuarioYFecha(userId, inicio, fin);
            } else {
                movimientos = movimientoService.obtenerMovimientosPorUsuario(userId);
            }
            
            // Filtrar por tipo si se especifica
            if (tipo != null && !tipo.equals("TODOS")) {
                movimientos = movimientos.stream()
                    .filter(m -> m.getTipo().toString().equals(tipo))
                    .collect(java.util.stream.Collectors.toList());
            }
            
            return ResponseEntity.ok(movimientos);
        } catch (Exception e) {
            log.error("Error al obtener movimientos: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", true, "message", "Error al obtener movimientos"));
        }
    }
    
    @GetMapping("/resumen")
    public ResponseEntity<?> obtenerResumen() {
        try {
            Long userId = securityUtils.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));
            
            Map<String, Object> resumen = movimientoService.obtenerResumenMovimientos(userId);
            return ResponseEntity.ok(resumen);
        } catch (Exception e) {
            log.error("Error al obtener resumen: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", true, "message", "Error al obtener resumen"));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarMovimiento(@PathVariable Long id) {
        try {
            Long userId = securityUtils.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));
            
            movimientoService.eliminarMovimiento(id, userId);
            log.info("Movimiento eliminado: ID {} por usuario {}", id, userId);
            
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            log.error("Error al eliminar movimiento: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("error", true, "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error al eliminar movimiento: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", true, "message", "Error al eliminar movimiento"));
        }
    }
}

