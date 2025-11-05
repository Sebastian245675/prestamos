package com.prestamos.controller;

import com.prestamos.config.InputSanitizer;
import com.prestamos.config.SecurityUtils;
import com.prestamos.dto.AbonoRequest;
import com.prestamos.dto.PrestamoRequest;
import com.prestamos.entity.Abono;
import com.prestamos.entity.Prestamo;
import com.prestamos.repository.AbonoRepository;
import com.prestamos.repository.CuotaRepository;
import com.prestamos.repository.PrestamoRepository;
import com.prestamos.service.PrestamoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/prestamos")
@RequiredArgsConstructor
@Slf4j
public class PrestamoController {
    
    private final PrestamoService prestamoService;
    private final PrestamoRepository prestamoRepository;
    private final AbonoRepository abonoRepository;
    private final CuotaRepository cuotaRepository;
    private final SecurityUtils securityUtils;
    private final InputSanitizer inputSanitizer;
    
    @PostMapping
    public ResponseEntity<?> crearPrestamo(@Valid @RequestBody PrestamoRequest request) {
        try {
            Long userId = securityUtils.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));
            
            // Sanitizar inputs
            sanitizePrestamoRequest(request);
            
            Prestamo prestamo = prestamoService.crearPrestamo(userId, request);
            log.info("Préstamo creado: ID {} por usuario {}", prestamo.getId(), userId);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(prestamo);
            
        } catch (IllegalArgumentException e) {
            log.error("Error de validación al crear préstamo: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(createErrorResponse("Error de validación: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Error al crear préstamo: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Error al crear el préstamo"));
        }
    }
    
    @GetMapping
    public ResponseEntity<?> obtenerPrestamos(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String search) {
        try {
            Long userId = securityUtils.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));
            
            // Sanitizar parámetros de búsqueda
            String sanitizedEstado = estado != null ? inputSanitizer.sanitize(estado) : null;
            String sanitizedSearch = search != null ? inputSanitizer.sanitize(search) : null;
            
            List<Prestamo> prestamos = prestamoService.obtenerPrestamosPorPrestamista(
                userId, sanitizedEstado, sanitizedSearch);
            
            return ResponseEntity.ok(prestamos);
            
        } catch (Exception e) {
            log.error("Error al obtener préstamos: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Error al obtener préstamos"));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPrestamo(@PathVariable String id) {
        try {
            Long userId = securityUtils.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));
            
            Long prestamoId = inputSanitizer.sanitizeLong(id);
            
            Prestamo prestamo = prestamoService.obtenerPrestamoPorId(prestamoId);
            
            // Verificar que el préstamo pertenezca al usuario
            if (!prestamo.getPrestamista().getId().equals(userId)) {
                log.warn("Intento de acceso no autorizado al préstamo {} por usuario {}", prestamoId, userId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(createErrorResponse("No tienes acceso a este préstamo"));
            }
            
            return ResponseEntity.ok(prestamo);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(createErrorResponse("ID de préstamo inválido"));
        } catch (Exception e) {
            log.error("Error al obtener préstamo: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Error al obtener el préstamo"));
        }
    }
    
    @PostMapping("/{id}/abonos")
    public ResponseEntity<?> registrarAbono(
            @PathVariable String id,
            @Valid @RequestBody AbonoRequest request) {
        try {
            Long userId = securityUtils.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));
            
            Long prestamoId = inputSanitizer.sanitizeLong(id);
            
            // Validar y sanitizar monto
            if (request.getMonto() == null || request.getMonto().compareTo(java.math.BigDecimal.ZERO) <= 0) {
                return ResponseEntity.badRequest()
                    .body(createErrorResponse("El monto debe ser mayor a cero"));
            }
            
            Abono abono = prestamoService.registrarAbono(prestamoId, userId, request);
            log.info("Abono registrado: ID {} para préstamo {} por usuario {}", 
                abono.getId(), prestamoId, userId);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(abono);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Error al registrar abono: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Error al registrar el abono: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{id}/abonos")
    public ResponseEntity<?> obtenerAbonos(@PathVariable String id) {
        try {
            Long userId = securityUtils.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));
            
            Long prestamoId = inputSanitizer.sanitizeLong(id);
            
            // Verificar que el préstamo pertenezca al usuario
            Prestamo prestamo = prestamoService.obtenerPrestamoPorId(prestamoId);
            if (!prestamo.getPrestamista().getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(createErrorResponse("No tienes acceso a este préstamo"));
            }
            
            List<Abono> abonos = abonoRepository.findByPrestamoId(prestamoId);
            return ResponseEntity.ok(abonos);
            
        } catch (Exception e) {
            log.error("Error al obtener abonos: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Error al obtener abonos"));
        }
    }
    
    @GetMapping("/{id}/cuotas")
    public ResponseEntity<?> obtenerCuotas(@PathVariable String id) {
        try {
            Long userId = securityUtils.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));
            
            Long prestamoId = inputSanitizer.sanitizeLong(id);
            
            // Verificar que el préstamo pertenezca al usuario
            Prestamo prestamo = prestamoService.obtenerPrestamoPorId(prestamoId);
            if (!prestamo.getPrestamista().getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(createErrorResponse("No tienes acceso a este préstamo"));
            }
            
            return ResponseEntity.ok(cuotaRepository.findByPrestamoId(prestamoId));
            
        } catch (Exception e) {
            log.error("Error al obtener cuotas: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Error al obtener cuotas"));
        }
    }
    
    @GetMapping("/clientes")
    public ResponseEntity<?> obtenerClientes() {
        try {
            Long userId = securityUtils.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));
            
            List<Prestamo> prestamos = prestamoService.obtenerPrestamosPorPrestamista(userId, null, null);
            
            // Agrupar préstamos por cliente (nombre + teléfono)
            Map<String, Map<String, Object>> clientesMap = new HashMap<>();
            int clienteIdCounter = 1;
            
            for (Prestamo prestamo : prestamos) {
                String claveCliente = prestamo.getNombreCliente() + "|" + prestamo.getTelefono();
                
                if (!clientesMap.containsKey(claveCliente)) {
                    Map<String, Object> clienteData = new HashMap<>();
                    clienteData.put("id", clienteIdCounter++);
                    clienteData.put("nombre", prestamo.getNombreCliente());
                    clienteData.put("telefono", prestamo.getTelefono());
                    clienteData.put("email", prestamo.getEmail());
                    clienteData.put("direccion", prestamo.getDireccion());
                    clienteData.put("zona", prestamo.getZona());
                    clienteData.put("totalPrestamos", 0);
                    clienteData.put("prestamosActivos", 0);
                    clienteData.put("totalPrestado", BigDecimal.ZERO);
                    clienteData.put("saldoPendiente", BigDecimal.ZERO);
                    clienteData.put("ultimaActividad", prestamo.getFechaCreacion().toLocalDate());
                    
                    clientesMap.put(claveCliente, clienteData);
                }
                
                Map<String, Object> clienteData = clientesMap.get(claveCliente);
                clienteData.put("totalPrestamos", (Integer) clienteData.get("totalPrestamos") + 1);
                
                if (prestamo.getEstado() == Prestamo.EstadoPrestamo.ACTIVO) {
                    clienteData.put("prestamosActivos", (Integer) clienteData.get("prestamosActivos") + 1);
                }
                
                BigDecimal totalPrestado = ((BigDecimal) clienteData.get("totalPrestado"))
                    .add(prestamo.getMontoPrestado());
                clienteData.put("totalPrestado", totalPrestado);
                
                BigDecimal saldoPendiente = ((BigDecimal) clienteData.get("saldoPendiente"))
                    .add(prestamo.getSaldoPendiente());
                clienteData.put("saldoPendiente", saldoPendiente);
                
                java.time.LocalDate ultimaActividad = (java.time.LocalDate) clienteData.get("ultimaActividad");
                if (prestamo.getFechaCreacion().toLocalDate().isAfter(ultimaActividad)) {
                    clienteData.put("ultimaActividad", prestamo.getFechaCreacion().toLocalDate());
                }
            }
            
            List<Map<String, Object>> clientes = new java.util.ArrayList<>(clientesMap.values());
            
            return ResponseEntity.ok(clientes);
            
        } catch (Exception e) {
            log.error("Error al obtener clientes: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Error al obtener clientes"));
        }
    }
    
    @GetMapping("/zonas")
    public ResponseEntity<?> obtenerZonas() {
        try {
            Long userId = securityUtils.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));
            
            // Usar consulta optimizada con DISTINCT directamente en BD
            List<String> zonas = prestamoRepository.findDistinctZonasByPrestamistaId(userId);
            
            return ResponseEntity.ok(zonas);
            
        } catch (Exception e) {
            log.error("Error al obtener zonas: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Error al obtener zonas"));
        }
    }
    
    @GetMapping("/dashboard")
    public ResponseEntity<?> obtenerDashboard() {
        try {
            Long userId = securityUtils.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));
            
            // Usar consulta optimizada con agregaciones SQL directamente en BD
            List<Object[]> statsList = prestamoRepository.getDashboardStats(userId);
            
            Map<String, Object> dashboard = new HashMap<>();
            
            // Manejar el caso cuando no hay préstamos
            if (statsList == null || statsList.isEmpty() || statsList.get(0) == null) {
                dashboard.put("totalPrestado", BigDecimal.ZERO);
                dashboard.put("totalCobrado", BigDecimal.ZERO);
                dashboard.put("totalPendiente", BigDecimal.ZERO);
                dashboard.put("prestamosActivos", 0L);
                dashboard.put("prestamosVencidos", 0L);
                dashboard.put("prestamosFinalizados", 0L);
            } else {
                Object[] stats = statsList.get(0);
                // Manejar valores null de forma segura y verificar el tipo antes de hacer cast
                dashboard.put("totalPrestado", convertToBigDecimal(stats[0]));
                dashboard.put("totalCobrado", convertToBigDecimal(stats[1]));
                dashboard.put("totalPendiente", convertToBigDecimal(stats[2]));
                dashboard.put("prestamosActivos", convertToLong(stats[3]));
                dashboard.put("prestamosVencidos", convertToLong(stats[4]));
                dashboard.put("prestamosFinalizados", convertToLong(stats[5]));
            }
            
            return ResponseEntity.ok(dashboard);
            
        } catch (Exception e) {
            log.error("Error al obtener dashboard: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Error al obtener dashboard: " + e.getMessage()));
        }
    }
    
    @GetMapping("/calendario")
    public ResponseEntity<?> obtenerCobrosCalendario(
            @RequestParam(required = false) String fecha,
            @RequestParam(required = false) String zona) {
        try {
            Long userId = securityUtils.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));
            
            List<Prestamo> prestamos = prestamoService.obtenerPrestamosPorPrestamista(userId, null, null);
            
            // Filtrar por zona si se especifica
            if (zona != null && !zona.equals("TODAS") && !zona.trim().isEmpty()) {
                prestamos = prestamos.stream()
                    .filter(p -> zona.equals(p.getZona()))
                    .collect(java.util.stream.Collectors.toList());
            }
            
            // Filtrar por fecha si se especifica
            if (fecha != null && !fecha.trim().isEmpty()) {
                try {
                    java.time.LocalDate fechaBusqueda = java.time.LocalDate.parse(fecha);
                    prestamos = prestamos.stream()
                        .filter(p -> {
                            // Buscar en las cuotas del préstamo
                            List<com.prestamos.entity.Cuota> cuotas = cuotaRepository.findByPrestamoId(p.getId());
                            return cuotas.stream()
                                .anyMatch(c -> c.getFechaVencimiento().equals(fechaBusqueda));
                        })
                        .collect(java.util.stream.Collectors.toList());
                } catch (Exception e) {
                    log.warn("Fecha inválida para calendario: {}", fecha);
                }
            }
            
            // Mapear a formato de calendario
            List<Map<String, Object>> cobros = prestamos.stream()
                .map(prestamo -> {
                    Map<String, Object> cobro = new HashMap<>();
                    cobro.put("id", prestamo.getId());
                    cobro.put("prestamoId", prestamo.getId());
                    cobro.put("nombreCliente", prestamo.getNombreCliente());
                    cobro.put("zona", prestamo.getZona());
                    cobro.put("telefono", prestamo.getTelefono());
                    cobro.put("saldoPendiente", prestamo.getSaldoPendiente());
                    cobro.put("estado", prestamo.getEstado().toString());
                    
                    // Obtener cuota más próxima o del día seleccionado
                    List<com.prestamos.entity.Cuota> cuotas = cuotaRepository.findByPrestamoId(prestamo.getId());
                    if (!cuotas.isEmpty()) {
                        java.time.LocalDate fechaBusqueda = fecha != null ? 
                            java.time.LocalDate.parse(fecha) : java.time.LocalDate.now();
                        
                        cuotas.stream()
                            .filter(c -> c.getFechaVencimiento().equals(fechaBusqueda) || 
                                        c.getFechaVencimiento().isAfter(fechaBusqueda))
                            .min(java.util.Comparator.comparing(com.prestamos.entity.Cuota::getFechaVencimiento))
                            .ifPresent(cuota -> {
                                cobro.put("fechaVencimiento", cuota.getFechaVencimiento().toString());
                                cobro.put("montoCuota", cuota.getMonto());
                            });
                    }
                    
                    return cobro;
                })
                .collect(java.util.stream.Collectors.toList());
            
            return ResponseEntity.ok(cobros);
            
        } catch (Exception e) {
            log.error("Error al obtener cobros del calendario: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Error al obtener cobros del calendario"));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarPrestamo(@PathVariable String id) {
        try {
            Long userId = securityUtils.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));
            
            Long prestamoId = inputSanitizer.sanitizeLong(id);
            
            // Verificar que el préstamo pertenezca al usuario
            Prestamo prestamo = prestamoService.obtenerPrestamoPorId(prestamoId);
            if (!prestamo.getPrestamista().getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(createErrorResponse("No tienes permiso para eliminar este préstamo"));
            }
            
            prestamoService.eliminarPrestamo(prestamoId);
            log.info("Préstamo eliminado: ID {} por usuario {}", prestamoId, userId);
            
            return ResponseEntity.ok().build();
            
        } catch (Exception e) {
            log.error("Error al eliminar préstamo: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Error al eliminar el préstamo"));
        }
    }
    
    private void sanitizePrestamoRequest(PrestamoRequest request) {
        if (request.getNombreCliente() != null) {
            request.setNombreCliente(inputSanitizer.sanitizeName(request.getNombreCliente()));
        }
        if (request.getTelefono() != null) {
            request.setTelefono(inputSanitizer.sanitizePhone(request.getTelefono()));
        }
        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            request.setEmail(inputSanitizer.sanitizeEmail(request.getEmail()));
        }
        if (request.getZona() != null) {
            request.setZona(inputSanitizer.sanitize(request.getZona()));
        }
    }
    
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("error", true);
        response.put("message", message);
        return response;
    }
    
    private BigDecimal convertToBigDecimal(Object value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }
        if (value instanceof BigDecimal) {
            return (BigDecimal) value;
        }
        if (value instanceof Number) {
            return BigDecimal.valueOf(((Number) value).doubleValue());
        }
        try {
            return new BigDecimal(value.toString());
        } catch (Exception e) {
            log.warn("Error al convertir {} a BigDecimal: {}", value, e.getMessage());
            return BigDecimal.ZERO;
        }
    }
    
    private Long convertToLong(Object value) {
        if (value == null) {
            return 0L;
        }
        if (value instanceof Long) {
            return (Long) value;
        }
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        if (value instanceof java.math.BigInteger) {
            return ((java.math.BigInteger) value).longValue();
        }
        try {
            return Long.parseLong(value.toString());
        } catch (Exception e) {
            log.warn("Error al convertir {} a Long: {}", value, e.getMessage());
            return 0L;
        }
    }
}
