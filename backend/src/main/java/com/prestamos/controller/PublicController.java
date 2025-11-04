package com.prestamos.controller;

import com.prestamos.entity.Abono;
import com.prestamos.entity.Cuota;
import com.prestamos.entity.Prestamo;
import com.prestamos.repository.AbonoRepository;
import com.prestamos.repository.CuotaRepository;
import com.prestamos.repository.PrestamoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/public")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PublicController {
    
    private final PrestamoRepository prestamoRepository;
    private final CuotaRepository cuotaRepository;
    private final AbonoRepository abonoRepository;
    
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

