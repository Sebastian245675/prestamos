package com.prestamos.controller;

import com.prestamos.config.SecurityUtils;
import com.prestamos.dto.RegisterRequest;
import com.prestamos.dto.UpdateCobradorRequest;
import com.prestamos.entity.Ruta;
import com.prestamos.entity.Usuario;
import com.prestamos.repository.PrestamoRepository;
import com.prestamos.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/cobradores")
@RequiredArgsConstructor
@Slf4j
public class CobradorController {
    
    private final UsuarioService usuarioService;
    private final PrestamoRepository prestamoRepository;
    private final SecurityUtils securityUtils;
    @Lazy
    private final PasswordEncoder passwordEncoder;
    
    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<?> obtenerCobradores() {
        try {
            Long prestamistaId = securityUtils.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));
            
            List<Usuario> cobradores = usuarioService.obtenerCobradores(prestamistaId);
            
            List<Map<String, Object>> cobradoresData = cobradores.stream()
                .map(cobrador -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("id", cobrador.getId());
                    data.put("nombreCompleto", cobrador.getNombreCompleto());
                    data.put("email", cobrador.getEmail());
                    data.put("telefono", cobrador.getTelefono());
                    data.put("activo", cobrador.getActivo());
                    data.put("permisos", cobrador.getPermisos() != null ? cobrador.getPermisos() : new HashMap<>());
                    
                    // Obtener rutas asignadas (dentro de la transacción)
                    List<Ruta> rutasAsignadas = usuarioService.obtenerRutasAsignadas(cobrador.getId());
                    List<Map<String, Object>> rutasData = rutasAsignadas.stream()
                        .map(ruta -> {
                            Map<String, Object> rutaMap = new HashMap<>();
                            rutaMap.put("id", ruta.getId());
                            rutaMap.put("nombre", ruta.getNombre());
                            rutaMap.put("color", ruta.getColor());
                            return rutaMap;
                        })
                        .collect(Collectors.toList());
                    data.put("rutasAsignadas", rutasData);
                    
                    // Determinar tipo de acceso
                    String tipoAcceso = rutasAsignadas.isEmpty() ? "TODOS" : "RUTAS";
                    data.put("tipoAccesoPrestamos", tipoAcceso);
                    
                    long numeroPrestamos = prestamoRepository.findByCobradorId(cobrador.getId()).size();
                    data.put("numeroPrestamos", numeroPrestamos);
                    
                    return data;
                })
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(cobradoresData);
        } catch (Exception e) {
            log.error("Error al obtener cobradores: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", true, "message", "Error al obtener cobradores"));
        }
    }
    
    @PostMapping
    public ResponseEntity<?> crearCobrador(@Valid @RequestBody RegisterRequest request) {
        try {
            Long prestamistaId = securityUtils.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));
            
            Usuario cobrador = usuarioService.crearCobrador(prestamistaId, request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", cobrador.getId());
            response.put("nombreCompleto", cobrador.getNombreCompleto());
            response.put("email", cobrador.getEmail());
            response.put("telefono", cobrador.getTelefono());
            response.put("activo", cobrador.getActivo());
            response.put("permisos", cobrador.getPermisos() != null ? cobrador.getPermisos() : new HashMap<>());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            log.error("Error al crear cobrador: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("error", true, "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error al crear cobrador: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", true, "message", "Error al crear cobrador"));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarCobrador(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCobradorRequest request) {
        try {
            Long prestamistaId = securityUtils.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));
            
            Usuario cobrador = usuarioService.findById(id)
                .orElseThrow(() -> new RuntimeException("Cobrador no encontrado"));
            
            // Verificar que el cobrador pertenezca al prestamista
            if (cobrador.getPrestamista() == null || !cobrador.getPrestamista().getId().equals(prestamistaId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", true, "message", "No tienes permiso para modificar este cobrador"));
            }
            
            // Actualizar campos
            cobrador.setNombreCompleto(request.getNombreCompleto());
            cobrador.setEmail(request.getEmail());
            cobrador.setTelefono(request.getTelefono());
            
            // Actualizar contraseña solo si se proporciona
            if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
                cobrador.setPassword(passwordEncoder.encode(request.getPassword()));
            }
            
            // Actualizar permisos si se proporcionan
            if (request.getPermisos() != null && !request.getPermisos().isEmpty()) {
                cobrador.setPermisos(request.getPermisos());
            }
            
            // Actualizar asignación de rutas si se especifica tipo de acceso por rutas
            if (request.getTipoAccesoPrestamos() != null && 
                "RUTAS".equals(request.getTipoAccesoPrestamos()) && 
                request.getRutasAsignadas() != null) {
                
                if (request.getRutasAsignadas().isEmpty()) {
                    // Si no hay rutas seleccionadas, eliminar todas las asignaciones
                    usuarioService.asignarRutasACobrador(id, prestamistaId, List.of());
                } else {
                    usuarioService.asignarRutasACobrador(id, prestamistaId, request.getRutasAsignadas());
                }
            } else if (request.getTipoAccesoPrestamos() != null && 
                      "TODOS".equals(request.getTipoAccesoPrestamos())) {
                // Si se cambia a TODOS, eliminar asignaciones de rutas
                usuarioService.asignarRutasACobrador(id, prestamistaId, List.of());
            }
            
            usuarioService.save(cobrador);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", cobrador.getId());
            response.put("nombreCompleto", cobrador.getNombreCompleto());
            response.put("email", cobrador.getEmail());
            response.put("telefono", cobrador.getTelefono());
            response.put("activo", cobrador.getActivo());
            response.put("permisos", cobrador.getPermisos() != null ? cobrador.getPermisos() : new HashMap<>());
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error al actualizar cobrador: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("error", true, "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error al actualizar cobrador: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", true, "message", "Error al actualizar cobrador"));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarCobrador(@PathVariable Long id) {
        try {
            Long prestamistaId = securityUtils.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));
            
            Usuario cobrador = usuarioService.findById(id)
                .orElseThrow(() -> new RuntimeException("Cobrador no encontrado"));
            
            // Verificar que el cobrador pertenezca al prestamista
            if (cobrador.getPrestamista() == null || !cobrador.getPrestamista().getId().equals(prestamistaId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", true, "message", "No tienes permiso para eliminar este cobrador"));
            }
            
            cobrador.setActivo(false);
            usuarioService.save(cobrador);
            
            log.info("Cobrador desactivado: ID {} por prestamista {}", id, prestamistaId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            log.error("Error al eliminar cobrador: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("error", true, "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error al eliminar cobrador: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", true, "message", "Error al eliminar cobrador"));
        }
    }
    
    @PutMapping("/{id}/activar")
    public ResponseEntity<?> activarCobrador(@PathVariable Long id) {
        try {
            Long prestamistaId = securityUtils.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));
            
            Usuario cobrador = usuarioService.findById(id)
                .orElseThrow(() -> new RuntimeException("Cobrador no encontrado"));
            
            // Verificar que el cobrador pertenezca al prestamista
            if (cobrador.getPrestamista() == null || !cobrador.getPrestamista().getId().equals(prestamistaId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", true, "message", "No tienes permiso para activar este cobrador"));
            }
            
            cobrador.setActivo(true);
            cobrador.setSuscripcionActiva(true);
            usuarioService.save(cobrador);
            
            log.info("Cobrador activado: ID {} por prestamista {}", id, prestamistaId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", cobrador.getId());
            response.put("nombreCompleto", cobrador.getNombreCompleto());
            response.put("email", cobrador.getEmail());
            response.put("telefono", cobrador.getTelefono());
            response.put("activo", cobrador.getActivo());
            response.put("permisos", cobrador.getPermisos() != null ? cobrador.getPermisos() : new HashMap<>());
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error al activar cobrador: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("error", true, "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error al activar cobrador: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", true, "message", "Error al activar cobrador"));
        }
    }
}

