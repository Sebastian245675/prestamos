package com.prestamos.controller;

import com.prestamos.config.SecurityUtils;
import com.prestamos.entity.Ruta;
import com.prestamos.service.RutaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/rutas")
@RequiredArgsConstructor
@Slf4j
public class RutaController {
    
    private final RutaService rutaService;
    private final SecurityUtils securityUtils;
    
    @PostMapping
    public ResponseEntity<?> crearRuta(@RequestBody Map<String, String> request) {
        try {
            Long userId = securityUtils.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));
            
            String nombre = request.get("nombre");
            String color = request.get("color");
            
            if (nombre == null || nombre.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", true, "message", "El nombre de la ruta es requerido"));
            }
            
            if (color == null || color.trim().isEmpty()) {
                color = "#3B82F6"; // Color por defecto azul
            }
            
            Ruta ruta = rutaService.crearRuta(userId, nombre, color);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(ruta);
            
        } catch (RuntimeException e) {
            log.error("Error al crear ruta: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("error", true, "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error inesperado al crear ruta: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", true, "message", "Error al crear la ruta"));
        }
    }
    
    @GetMapping
    public ResponseEntity<?> obtenerRutas() {
        try {
            Long userId = securityUtils.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));
            
            List<Ruta> rutas = rutaService.obtenerRutas(userId);
            
            return ResponseEntity.ok(rutas);
            
        } catch (Exception e) {
            log.error("Error al obtener rutas: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", true, "message", "Error al obtener rutas"));
        }
    }
    
    @GetMapping("/activas")
    public ResponseEntity<?> obtenerRutasActivas() {
        try {
            Long userId = securityUtils.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));
            
            List<Ruta> rutas = rutaService.obtenerRutasActivas(userId);
            
            return ResponseEntity.ok(rutas);
            
        } catch (Exception e) {
            log.error("Error al obtener rutas activas: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", true, "message", "Error al obtener rutas activas"));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarRuta(@PathVariable Long id) {
        try {
            Long userId = securityUtils.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));
            
            rutaService.eliminarRuta(id, userId);
            
            return ResponseEntity.ok(Map.of("message", "Ruta eliminada exitosamente"));
            
        } catch (RuntimeException e) {
            log.error("Error al eliminar ruta: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("error", true, "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error inesperado al eliminar ruta: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", true, "message", "Error al eliminar la ruta"));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarRuta(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            Long userId = securityUtils.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));
            
            String nombre = request.get("nombre");
            String color = request.get("color");
            
            Ruta ruta = rutaService.actualizarRuta(id, userId, nombre, color);
            
            return ResponseEntity.ok(ruta);
            
        } catch (RuntimeException e) {
            log.error("Error al actualizar ruta: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("error", true, "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error inesperado al actualizar ruta: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", true, "message", "Error al actualizar la ruta"));
        }
    }
}

