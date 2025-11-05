package com.prestamos.controller;

import com.prestamos.entity.Abono;
import com.prestamos.entity.Cuota;
import com.prestamos.entity.Prestamo;
import com.prestamos.repository.AbonoRepository;
import com.prestamos.repository.CuotaRepository;
import com.prestamos.repository.PrestamoRepository;
import com.prestamos.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/public")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class PublicController {
    
    private final PrestamoRepository prestamoRepository;
    private final CuotaRepository cuotaRepository;
    private final AbonoRepository abonoRepository;
    private final UsuarioRepository usuarioRepository;
    
    @GetMapping("/health")
    public String health() {
        return "OK";
    }
    
    /**
     * Valida si un código de referido existe y es válido
     * Endpoint público para usar durante el registro
     */
    @GetMapping("/validar-codigo-referido/{codigo}")
    public ResponseEntity<?> validarCodigoReferido(@PathVariable String codigo) {
        try {
            // Validar formato básico del código (REF-XXXXXX-YYYYYY)
            if (codigo == null || codigo.trim().isEmpty() || !codigo.startsWith("REF-")) {
                return ResponseEntity.ok(Map.of(
                    "valido", false,
                    "mensaje", "Formato de código inválido"
                ));
            }
            
            // Buscar usuario con ese código
            boolean existe = usuarioRepository.findByCodigoReferido(codigo.trim().toUpperCase()).isPresent();
            
            if (existe) {
                return ResponseEntity.ok(Map.of(
                    "valido", true,
                    "mensaje", "Código válido"
                ));
            } else {
                return ResponseEntity.ok(Map.of(
                    "valido", false,
                    "mensaje", "Código de referido no encontrado"
                ));
            }
            
        } catch (Exception e) {
            log.error("Error al validar código de referido: {}", e.getMessage());
            return ResponseEntity.ok(Map.of(
                "valido", false,
                "mensaje", "Error al validar el código"
            ));
        }
    }
    
    @GetMapping("/prestamos/{id}")
    public ResponseEntity<Prestamo> obtenerPrestamo(@PathVariable Long id) {
        Prestamo prestamo = prestamoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Préstamo no encontrado"));
        return ResponseEntity.ok(prestamo);
    }
    
    @GetMapping("/prestamos/{id}/cuotas")
    public ResponseEntity<List<Cuota>> obtenerCuotas(@PathVariable Long id) {
        List<Cuota> cuotas = cuotaRepository.findByPrestamoId(id);
        return ResponseEntity.ok(cuotas);
    }
    
    @GetMapping("/prestamos/{id}/abonos")
    public ResponseEntity<List<Abono>> obtenerAbonos(@PathVariable Long id) {
        List<Abono> abonos = abonoRepository.findByPrestamoId(id);
        return ResponseEntity.ok(abonos);
    }
}
