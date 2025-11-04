package com.prestamos.controller;

import com.prestamos.dto.AbonoRequest;
import com.prestamos.dto.PrestamoRequest;
import com.prestamos.entity.Abono;
import com.prestamos.entity.Prestamo;
import com.prestamos.repository.AbonoRepository;
import com.prestamos.repository.CuotaRepository;
import com.prestamos.service.PrestamoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/prestamos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PrestamoController {
    
    private final PrestamoService prestamoService;
    private final AbonoRepository abonoRepository;
    private final CuotaRepository cuotaRepository;
    
    // En producción, obtener el ID del usuario desde el token JWT
    private Long getCurrentUserId() {
        // Por ahora, usar ID 1 en modo desarrollo
        return 1L;
    }
    
    @PostMapping
    public ResponseEntity<Prestamo> crearPrestamo(@Valid @RequestBody PrestamoRequest request) {
        Prestamo prestamo = prestamoService.crearPrestamo(getCurrentUserId(), request);
        return ResponseEntity.ok(prestamo);
    }
    
    @GetMapping
    public ResponseEntity<List<Prestamo>> obtenerPrestamos() {
        List<Prestamo> prestamos = prestamoService.obtenerPrestamosPorPrestamista(getCurrentUserId());
        return ResponseEntity.ok(prestamos);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Prestamo> obtenerPrestamo(@PathVariable Long id) {
        List<Prestamo> prestamos = prestamoService.obtenerPrestamosPorPrestamista(getCurrentUserId());
        Prestamo prestamo = prestamos.stream()
            .filter(p -> p.getId().equals(id))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Préstamo no encontrado"));
        return ResponseEntity.ok(prestamo);
    }
    
    @GetMapping("/{id}/abonos")
    public ResponseEntity<List<Abono>> obtenerAbonos(@PathVariable Long id) {
        List<Abono> abonos = abonoRepository.findByPrestamoId(id);
        return ResponseEntity.ok(abonos);
    }
    
    @GetMapping("/{id}/cuotas")
    public ResponseEntity<List<com.prestamos.entity.Cuota>> obtenerCuotas(@PathVariable Long id) {
        List<com.prestamos.entity.Cuota> cuotas = cuotaRepository.findByPrestamoId(id);
        return ResponseEntity.ok(cuotas);
    }
    
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> obtenerDashboard() {
        List<Prestamo> prestamos = prestamoService.obtenerPrestamosPorPrestamista(getCurrentUserId());
        
        double totalPrestado = prestamos.stream()
            .mapToDouble(p -> p.getMontoPrestado().doubleValue())
            .sum();
        
        double totalPendiente = prestamos.stream()
            .mapToDouble(p -> p.getSaldoPendiente().doubleValue())
            .sum();
        
        double totalCobrado = totalPrestado - totalPendiente;
        
        long prestamosActivos = prestamos.stream()
            .filter(p -> p.getEstado() == Prestamo.EstadoPrestamo.ACTIVO)
            .count();
        
        long prestamosVencidos = prestamos.stream()
            .filter(p -> p.getEstado() == Prestamo.EstadoPrestamo.VENCIDO)
            .count();
        
        long prestamosFinalizados = prestamos.stream()
            .filter(p -> p.getEstado() == Prestamo.EstadoPrestamo.FINALIZADO)
            .count();
        
        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("totalPrestado", totalPrestado);
        dashboard.put("totalCobrado", totalCobrado);
        dashboard.put("totalPendiente", totalPendiente);
        dashboard.put("prestamosActivos", prestamosActivos);
        dashboard.put("prestamosVencidos", prestamosVencidos);
        dashboard.put("prestamosFinalizados", prestamosFinalizados);
        
        return ResponseEntity.ok(dashboard);
    }
    
    @PostMapping("/{id}/abonos")
    public ResponseEntity<Abono> registrarAbono(
            @PathVariable Long id,
            @Valid @RequestBody AbonoRequest request) {
        Abono abono = prestamoService.registrarAbono(id, getCurrentUserId(), request);
        return ResponseEntity.ok(abono);
    }
    
    @GetMapping("/zonas")
    public ResponseEntity<List<String>> obtenerZonas() {
        List<String> zonas = prestamoService.obtenerZonas(getCurrentUserId());
        return ResponseEntity.ok(zonas);
    }
    
    @GetMapping("/calendario")
    public ResponseEntity<List<Map<String, Object>>> obtenerCobrosCalendario(
            @RequestParam String fecha,
            @RequestParam(required = false) String zona) {
        List<Prestamo> prestamos = prestamoService.obtenerPrestamosPorPrestamista(getCurrentUserId());
        
        if (zona != null && !zona.equals("TODAS")) {
            prestamos = prestamos.stream()
                .filter(p -> p.getZona().equals(zona))
                .collect(java.util.stream.Collectors.toList());
        }
        
        List<Map<String, Object>> cobros = prestamos.stream()
            .map(p -> {
                Map<String, Object> cobro = new HashMap<>();
                cobro.put("id", p.getId());
                cobro.put("nombreCliente", p.getNombreCliente());
                cobro.put("zona", p.getZona());
                cobro.put("fechaVencimiento", p.getFechaVencimiento());
                cobro.put("saldoPendiente", p.getSaldoPendiente());
                cobro.put("estado", p.getEstado().toString());
                
                // Calcular monto de cuota (simplificado)
                double montoCuota = p.getMontoPrestado().doubleValue() / p.getNumeroCuotas();
                cobro.put("montoCuota", montoCuota);
                
                return cobro;
            })
            .collect(java.util.stream.Collectors.toList());
        
        return ResponseEntity.ok(cobros);
    }
}
