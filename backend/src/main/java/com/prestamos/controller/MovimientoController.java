package com.prestamos.controller;

import com.prestamos.dto.MovimientoRequest;
import com.prestamos.entity.Movimiento;
import com.prestamos.service.MovimientoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/movimientos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MovimientoController {
    
    private final MovimientoService movimientoService;
    
    private Long getCurrentUserId() {
        return 1L;
    }
    
    @PostMapping
    public ResponseEntity<Movimiento> crearMovimiento(@Valid @RequestBody MovimientoRequest request) {
        Movimiento movimiento = movimientoService.crearMovimiento(getCurrentUserId(), request);
        return ResponseEntity.ok(movimiento);
    }
    
    @GetMapping
    public ResponseEntity<List<Movimiento>> obtenerMovimientos(
            @RequestParam(required = false) String fechaInicio,
            @RequestParam(required = false) String fechaFin) {
        
        List<Movimiento> movimientos;
        
        if (fechaInicio != null && fechaFin != null) {
            LocalDate inicio = LocalDate.parse(fechaInicio);
            LocalDate fin = LocalDate.parse(fechaFin);
            movimientos = movimientoService.obtenerMovimientosPorUsuarioYFecha(
                getCurrentUserId(), inicio, fin);
        } else {
            movimientos = movimientoService.obtenerMovimientosPorUsuario(getCurrentUserId());
        }
        
        return ResponseEntity.ok(movimientos);
    }
    
    @GetMapping("/resumen")
    public ResponseEntity<Map<String, Object>> obtenerResumen() {
        Map<String, Object> resumen = movimientoService.obtenerResumenMovimientos(getCurrentUserId());
        return ResponseEntity.ok(resumen);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarMovimiento(@PathVariable Long id) {
        movimientoService.eliminarMovimiento(id, getCurrentUserId());
        return ResponseEntity.ok().build();
    }
}

