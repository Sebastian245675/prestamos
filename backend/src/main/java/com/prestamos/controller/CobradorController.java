package com.prestamos.controller;

import com.prestamos.config.SecurityUtils;
import com.prestamos.dto.RegisterRequest;
import com.prestamos.entity.Usuario;
import com.prestamos.repository.PrestamoRepository;
import com.prestamos.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private final PasswordEncoder passwordEncoder;
    
    @GetMapping
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
            @Valid @RequestBody RegisterRequest request) {
        try {
            Long prestamistaId = securityUtils.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));
            
            Usuario cobrador = usuarioService.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Cobrador no encontrado"));
            
            // Verificar que el cobrador pertenezca al prestamista
            if (cobrador.getPrestamista() == null || !cobrador.getPrestamista().getId().equals(prestamistaId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", true, "message", "No tienes permiso para modificar este cobrador"));
            }
            
            if (request.getNombreCompleto() != null) {
                cobrador.setNombreCompleto(request.getNombreCompleto());
            }
            if (request.getTelefono() != null) {
                cobrador.setTelefono(request.getTelefono());
            }
            if (request.getPassword() != null && !request.getPassword().isEmpty()) {
                cobrador.setPassword(passwordEncoder.encode(request.getPassword()));
            }
            
            usuarioService.save(cobrador);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", cobrador.getId());
            response.put("nombreCompleto", cobrador.getNombreCompleto());
            response.put("email", cobrador.getEmail());
            response.put("telefono", cobrador.getTelefono());
            response.put("activo", cobrador.getActivo());
            
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
}

