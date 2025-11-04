package com.prestamos.controller;

import com.prestamos.dto.RegisterRequest;
import com.prestamos.entity.Usuario;
import com.prestamos.repository.PrestamoRepository;
import com.prestamos.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/cobradores")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CobradorController {
    
    private final UsuarioService usuarioService;
    private final PrestamoRepository prestamoRepository;
    
    private Long getCurrentUserId() {
        return 1L;
    }
    
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> obtenerCobradores() {
        List<Usuario> cobradores = usuarioService.obtenerCobradores(getCurrentUserId());
        
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
    }
    
    @PostMapping
    public ResponseEntity<Usuario> crearCobrador(@Valid @RequestBody RegisterRequest request) {
        Usuario cobrador = usuarioService.crearCobrador(getCurrentUserId(), request);
        return ResponseEntity.ok(cobrador);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Usuario> actualizarCobrador(
            @PathVariable Long id,
            @Valid @RequestBody RegisterRequest request) {
        // TODO: Implementar actualización
        Usuario cobrador = usuarioService.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("Cobrador no encontrado"));
        
        if (request.getNombreCompleto() != null) {
            cobrador.setNombreCompleto(request.getNombreCompleto());
        }
        if (request.getTelefono() != null) {
            cobrador.setTelefono(request.getTelefono());
        }
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            // Actualizar contraseña
        }
        
        return ResponseEntity.ok(cobrador);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarCobrador(@PathVariable Long id) {
        // TODO: Implementar eliminación
        return ResponseEntity.ok().build();
    }
}

