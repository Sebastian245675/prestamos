package com.prestamos.controller;

import com.prestamos.entity.Prestamo;
import com.prestamos.service.PrestamoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/reportes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReporteController {
    
    private final PrestamoService prestamoService;
    
    private Long getCurrentUserId() {
        return 1L;
    }
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> obtenerReportes(
            @RequestParam(required = false) String fechaInicio,
            @RequestParam(required = false) String fechaFin) {
        
        List<Prestamo> prestamos = prestamoService.obtenerPrestamosPorPrestamista(getCurrentUserId());
        
        // Filtrar por fechas si se proporcionan
        if (fechaInicio != null && fechaFin != null) {
            LocalDate inicio = LocalDate.parse(fechaInicio);
            LocalDate fin = LocalDate.parse(fechaFin);
            prestamos = prestamos.stream()
                .filter(p -> !p.getFechaInicio().isBefore(inicio) && !p.getFechaInicio().isAfter(fin))
                .collect(Collectors.toList());
        }
        
        double totalPrestado = prestamos.stream()
            .mapToDouble(p -> p.getMontoPrestado().doubleValue())
            .sum();
        
        double totalPendiente = prestamos.stream()
            .mapToDouble(p -> p.getSaldoPendiente().doubleValue())
            .sum();
        
        double totalCobrado = totalPrestado - totalPendiente;
        
        double totalPerdido = prestamos.stream()
            .filter(p -> p.getEstado() == Prestamo.EstadoPrestamo.INCOBRABLE)
            .mapToDouble(p -> p.getSaldoPendiente().doubleValue())
            .sum();
        
        // Productividad por zona
        List<Map<String, Object>> porZona = prestamos.stream()
            .collect(Collectors.groupingBy(Prestamo::getZona))
            .entrySet().stream()
            .map(entry -> {
                Map<String, Object> zonaData = new HashMap<>();
                zonaData.put("zona", entry.getKey());
                
                double prestado = entry.getValue().stream()
                    .mapToDouble(p -> p.getMontoPrestado().doubleValue())
                    .sum();
                double cobrado = entry.getValue().stream()
                    .mapToDouble(p -> (p.getMontoPrestado().doubleValue() - p.getSaldoPendiente().doubleValue()))
                    .sum();
                
                zonaData.put("prestado", prestado);
                zonaData.put("cobrado", cobrado);
                return zonaData;
            })
            .collect(Collectors.toList());
        
        // Por periodo (mensual)
        List<Map<String, Object>> porPeriodo = prestamos.stream()
            .collect(Collectors.groupingBy(p -> p.getFechaInicio().getYear() + "-" + 
                String.format("%02d", p.getFechaInicio().getMonthValue())))
            .entrySet().stream()
            .map(entry -> {
                Map<String, Object> periodoData = new HashMap<>();
                periodoData.put("periodo", entry.getKey());
                
                double prestado = entry.getValue().stream()
                    .mapToDouble(p -> p.getMontoPrestado().doubleValue())
                    .sum();
                double cobrado = entry.getValue().stream()
                    .mapToDouble(p -> (p.getMontoPrestado().doubleValue() - p.getSaldoPendiente().doubleValue()))
                    .sum();
                
                periodoData.put("prestado", prestado);
                periodoData.put("cobrado", cobrado);
                return periodoData;
            })
            .sorted((a, b) -> a.get("periodo").toString().compareTo(b.get("periodo").toString()))
            .collect(Collectors.toList());
        
        Map<String, Object> reportes = new HashMap<>();
        reportes.put("totalPrestado", totalPrestado);
        reportes.put("totalCobrado", totalCobrado);
        reportes.put("totalPendiente", totalPendiente);
        reportes.put("totalPerdido", totalPerdido);
        reportes.put("porZona", porZona);
        reportes.put("porPeriodo", porPeriodo);
        
        return ResponseEntity.ok(reportes);
    }
    
    @GetMapping("/exportar/pdf")
    public ResponseEntity<String> exportarPDF(
            @RequestParam(required = false) String fechaInicio,
            @RequestParam(required = false) String fechaFin) {
        // TODO: Implementar generación de PDF
        return ResponseEntity.ok("PDF export - TODO");
    }
    
    @GetMapping("/exportar/excel")
    public ResponseEntity<String> exportarExcel(
            @RequestParam(required = false) String fechaInicio,
            @RequestParam(required = false) String fechaFin) {
        // TODO: Implementar generación de Excel
        return ResponseEntity.ok("Excel export - TODO");
    }
}

