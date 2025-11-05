package com.prestamos.service;

import com.prestamos.dto.AbonoRequest;
import com.prestamos.dto.PrestamoRequest;
import com.prestamos.entity.*;
import com.prestamos.repository.*;
import com.prestamos.service.ReferidoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PrestamoService {
    
    private final PrestamoRepository prestamoRepository;
    private final UsuarioRepository usuarioRepository;
    private final AbonoRepository abonoRepository;
    private final CuotaRepository cuotaRepository;
    private final ReferidoService referidoService;
    
    @Transactional
    public Prestamo crearPrestamo(Long prestamistaId, PrestamoRequest request) {
        Usuario prestamista = usuarioRepository.findById(prestamistaId)
            .orElseThrow(() -> new RuntimeException("Prestamista no encontrado"));
        
        Prestamo prestamo = new Prestamo();
        prestamo.setPrestamista(prestamista);
        prestamo.setNombreCliente(request.getNombreCliente());
        prestamo.setDireccion(request.getDireccion() != null ? request.getDireccion() : "");
        prestamo.setTelefono(request.getTelefono());
        prestamo.setEmail(request.getEmail());
        prestamo.setMontoPrestado(request.getMontoPrestado());
        prestamo.setSaldoPendiente(request.getMontoPrestado());
        prestamo.setNumeroCuotas(request.getNumeroCuotas());
        prestamo.setCuotasPagadas(0);
        prestamo.setFrecuenciaPago(Prestamo.FrecuenciaPago.valueOf(request.getFrecuenciaPago()));
        prestamo.setFechaInicio(request.getFechaInicio());
        prestamo.setZona(request.getZona());
        prestamo.setRecordatoriosActivos(request.getRecordatoriosActivos() != null ? 
            request.getRecordatoriosActivos() : true);
        prestamo.setEstado(Prestamo.EstadoPrestamo.ACTIVO);
        
        // Asignar cobrador si se especifica
        if (request.getCobradorId() != null) {
            Usuario cobrador = usuarioRepository.findById(request.getCobradorId())
                .orElseThrow(() -> new RuntimeException("Cobrador no encontrado"));
            prestamo.setCobrador(cobrador);
        }
        
        // Calcular fecha de vencimiento
        LocalDate fechaVencimiento = calcularFechaVencimiento(
            request.getFechaInicio(), 
            request.getNumeroCuotas(),
            Prestamo.FrecuenciaPago.valueOf(request.getFrecuenciaPago())
        );
        prestamo.setFechaVencimiento(fechaVencimiento);
        
        prestamo = prestamoRepository.save(prestamo);
        
        // Crear cuotas
        crearCuotas(prestamo);
        
        // Actualizar estado de referidos si el prestamista es un referido
        try {
            referidoService.actualizarEstadoReferidos(prestamistaId);
        } catch (Exception e) {
            log.warn("Error al actualizar estado de referidos: {}", e.getMessage());
        }
        
        log.info("Préstamo creado: ID {} para cliente {}", prestamo.getId(), request.getNombreCliente());
        
        return prestamo;
    }
    
    // Método optimizado para obtener préstamos - ahora soporta cobradores con consultas eficientes en BD
    @Transactional(readOnly = true)
    public List<Prestamo> obtenerPrestamosPorUsuario(Usuario usuario, String estado, String search) {
        // Recargar el usuario dentro de la transacción para asegurar que las relaciones estén disponibles
        Usuario usuarioCompleto = usuarioRepository.findById(usuario.getId())
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        Long prestamistaId;
        List<String> zonasPermitidas = null;
        
        // Determinar el prestamista y las zonas permitidas según el rol
        if (usuarioCompleto.getRol() == Usuario.RolUsuario.PRESTAMISTA) {
            prestamistaId = usuarioCompleto.getId();
            // Prestamistas ven todos sus préstamos - usar consulta normal
            return obtenerPrestamosPorPrestamista(prestamistaId, estado, search);
        } else if (usuarioCompleto.getRol() == Usuario.RolUsuario.COBRADOR) {
            // Obtener el prestamista del cobrador
            if (usuarioCompleto.getPrestamista() == null) {
                log.warn("Cobrador {} no tiene prestamista asignado", usuarioCompleto.getId());
                return new ArrayList<>();
            }
            prestamistaId = usuarioCompleto.getPrestamista().getId();
            
            // Verificar si tiene acceso restringido por rutas
            // Cargar rutas asignadas dentro de la transacción (forzar carga lazy)
            if (usuarioCompleto.getRutasAsignadas() != null) {
                usuarioCompleto.getRutasAsignadas().size(); // Esto fuerza la carga lazy
                if (!usuarioCompleto.getRutasAsignadas().isEmpty()) {
                    // Si tiene rutas asignadas, solo mostrar préstamos de esas rutas
                    zonasPermitidas = usuarioCompleto.getRutasAsignadas().stream()
                        .map(Ruta::getNombre)
                        .collect(Collectors.toList());
                }
            }
            // Si no tiene rutas asignadas, tipoAccesoPrestamos = "TODOS", mostrar todos
            
            // Usar consultas optimizadas directamente en BD según los filtros
            if (zonasPermitidas != null && !zonasPermitidas.isEmpty()) {
                // Filtrar por zonas usando consulta optimizada en BD
                return obtenerPrestamosPorPrestamistaYZonas(prestamistaId, zonasPermitidas, estado, search);
            } else {
                // Sin restricción de zonas - mostrar todos los préstamos del prestamista
                return obtenerPrestamosPorPrestamista(prestamistaId, estado, search);
            }
        } else {
            // Cliente u otro rol - no tiene acceso
            return new ArrayList<>();
        }
    }
    
    // Método optimizado para obtener préstamos filtrando por zonas directamente en BD
    @Transactional(readOnly = true)
    private List<Prestamo> obtenerPrestamosPorPrestamistaYZonas(
            Long prestamistaId, List<String> zonas, String estado, String search) {
        // Si hay búsqueda y estado
        if (search != null && !search.trim().isEmpty() && estado != null && !estado.equals("TODOS")) {
            try {
                Prestamo.EstadoPrestamo estadoEnum = Prestamo.EstadoPrestamo.valueOf(estado);
                return prestamoRepository.findByPrestamistaIdAndEstadoAndZonaInAndSearchTerm(
                    prestamistaId, estadoEnum, zonas, search.trim()
                );
            } catch (IllegalArgumentException e) {
                log.warn("Estado inválido: {}", estado);
            }
        }
        
        // Si solo hay búsqueda
        if (search != null && !search.trim().isEmpty()) {
            return prestamoRepository.findByPrestamistaIdAndZonaInAndSearchTerm(
                prestamistaId, zonas, search.trim()
            );
        }
        
        // Si solo hay estado
        if (estado != null && !estado.equals("TODOS")) {
            try {
                Prestamo.EstadoPrestamo estadoEnum = Prestamo.EstadoPrestamo.valueOf(estado);
                return prestamoRepository.findByPrestamistaIdAndEstadoAndZonaIn(
                    prestamistaId, estadoEnum, zonas
                );
            } catch (IllegalArgumentException e) {
                log.warn("Estado inválido: {}", estado);
            }
        }
        
        // Sin filtros adicionales, solo por zonas
        return prestamoRepository.findByPrestamistaIdAndZonaIn(prestamistaId, zonas);
    }
    
    // Método optimizado para obtener préstamos
    @Transactional(readOnly = true)
    public List<Prestamo> obtenerPrestamosPorPrestamista(Long prestamistaId, String estado, String search) {
        // Si hay búsqueda y estado
        if (search != null && !search.trim().isEmpty() && estado != null && !estado.equals("TODOS")) {
            try {
                Prestamo.EstadoPrestamo estadoEnum = Prestamo.EstadoPrestamo.valueOf(estado);
                return prestamoRepository.findByPrestamistaIdAndEstadoAndSearchTerm(
                    prestamistaId, estadoEnum, search.trim()
                );
            } catch (IllegalArgumentException e) {
                log.warn("Estado inválido: {}", estado);
            }
        }
        
        // Si solo hay búsqueda
        if (search != null && !search.trim().isEmpty()) {
            return prestamoRepository.findByPrestamistaIdAndSearchTerm(prestamistaId, search.trim());
        }
        
        // Si solo hay estado
        if (estado != null && !estado.equals("TODOS")) {
            try {
                Prestamo.EstadoPrestamo estadoEnum = Prestamo.EstadoPrestamo.valueOf(estado);
                return prestamoRepository.findByPrestamistaIdAndEstadoOrderByFechaCreacionDesc(
                    prestamistaId, estadoEnum
                );
            } catch (IllegalArgumentException e) {
                log.warn("Estado inválido: {}", estado);
            }
        }
        
        // Sin filtros, obtener todos
        return prestamoRepository.findByPrestamistaIdOrderByFechaCreacionDesc(prestamistaId);
    }
    
    @Transactional(readOnly = true)
    public Prestamo obtenerPrestamoPorId(Long id) {
        return prestamoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Préstamo no encontrado"));
    }
    
    @Transactional
    public Abono registrarAbono(Long prestamoId, Long usuarioId, AbonoRequest request) {
        Prestamo prestamo = prestamoRepository.findById(prestamoId)
            .orElseThrow(() -> new RuntimeException("Préstamo no encontrado"));
        
        Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // Validar monto
        if (request.getMonto() == null || request.getMonto().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El monto debe ser mayor a cero");
        }
        
        if (request.getMonto().compareTo(prestamo.getSaldoPendiente()) > 0) {
            throw new IllegalArgumentException("El monto del abono no puede ser mayor al saldo pendiente");
        }
        
        // Crear abono
        Abono abono = new Abono();
        abono.setPrestamo(prestamo);
        abono.setUsuario(usuario);
        abono.setMonto(request.getMonto());
        abono.setFechaAbono(request.getFechaAbono() != null ? request.getFechaAbono() : LocalDate.now());
        abono.setObservaciones(request.getObservaciones());
        if (request.getEsSoloIntereses() != null) {
            abono.setEsSoloIntereses(request.getEsSoloIntereses());
        }
        
        abono = abonoRepository.save(abono);
        
        // Actualizar préstamo
        BigDecimal nuevoSaldo = prestamo.getSaldoPendiente().subtract(request.getMonto());
        prestamo.setSaldoPendiente(nuevoSaldo);
        
        // Calcular cuotas pagadas
        try {
            if (prestamo.getNumeroCuotas() != null && prestamo.getNumeroCuotas() > 0) {
                BigDecimal montoPorCuota = prestamo.getMontoPrestado()
                    .divide(new BigDecimal(prestamo.getNumeroCuotas()), 2, RoundingMode.HALF_UP);
                
                if (montoPorCuota.compareTo(BigDecimal.ZERO) > 0) {
                    BigDecimal montoPagado = prestamo.getMontoPrestado().subtract(nuevoSaldo);
                    int nuevasCuotasPagadas = montoPagado
                        .divide(montoPorCuota, 0, RoundingMode.DOWN)
                        .intValue();
                    prestamo.setCuotasPagadas(Math.min(nuevasCuotasPagadas, prestamo.getNumeroCuotas()));
                }
            }
        } catch (ArithmeticException e) {
            log.warn("Error calculando cuotas pagadas para préstamo {}: {}", prestamoId, e.getMessage());
            // Si hay error en el cálculo, usar una aproximación basada en el porcentaje pagado
            if (prestamo.getMontoPrestado().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal porcentajePagado = BigDecimal.ONE
                    .subtract(nuevoSaldo.divide(prestamo.getMontoPrestado(), 4, RoundingMode.HALF_UP));
                int aproximacionCuotas = porcentajePagado
                    .multiply(new BigDecimal(prestamo.getNumeroCuotas()))
                    .setScale(0, RoundingMode.HALF_UP)
                    .intValue();
                prestamo.setCuotasPagadas(Math.min(aproximacionCuotas, prestamo.getNumeroCuotas()));
            }
        }
        
        // Actualizar estado
        if (nuevoSaldo.compareTo(BigDecimal.ZERO) <= 0) {
            prestamo.setEstado(Prestamo.EstadoPrestamo.FINALIZADO);
            prestamo.setCuotasPagadas(prestamo.getNumeroCuotas());
        } else if (prestamo.getFechaVencimiento() != null && 
                   prestamo.getFechaVencimiento().isBefore(LocalDate.now()) && 
                   prestamo.getEstado() == Prestamo.EstadoPrestamo.ACTIVO) {
            prestamo.setEstado(Prestamo.EstadoPrestamo.VENCIDO);
        }
        
        prestamoRepository.save(prestamo);
        
        // Sincronizar todas las cuotas basándose en todos los abonos registrados
        sincronizarCuotasConAbonos(prestamo);
        
        log.info("Abono registrado: ID {} de {} para préstamo {}", 
            abono.getId(), request.getMonto(), prestamoId);
        
        return abono;
    }
    
    /**
     * Sincroniza las cuotas del préstamo basándose en todos los abonos registrados.
     * Este método asegura que las cuotas se marquen como PAGADAS si el total de abonos
     * cubre el monto de las cuotas en orden.
     */
    private void sincronizarCuotasConAbonos(Prestamo prestamo) {
        try {
            log.info("Sincronizando cuotas para préstamo {} basándose en todos los abonos", prestamo.getId());
            
            // Obtener todos los abonos del préstamo ordenados por fecha
            List<Abono> abonos = abonoRepository.findByPrestamoId(prestamo.getId())
                .stream()
                .filter(a -> !Boolean.TRUE.equals(a.getEsSoloIntereses())) // Excluir abonos solo de intereses
                .sorted((a1, a2) -> a1.getFechaAbono().compareTo(a2.getFechaAbono()))
                .collect(java.util.stream.Collectors.toList());
            
            BigDecimal totalAbonos = abonos.stream()
                .map(Abono::getMonto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            log.info("Total abonos encontrados: {} con monto total: {}", abonos.size(), totalAbonos);
            
            // Obtener todas las cuotas ordenadas por número
            List<Cuota> todasLasCuotas = cuotaRepository.findByPrestamoId(prestamo.getId())
                .stream()
                .sorted((c1, c2) -> c1.getNumeroCuota().compareTo(c2.getNumeroCuota()))
                .collect(java.util.stream.Collectors.toList());
            
            log.info("Total cuotas encontradas: {}", todasLasCuotas.size());
            
            BigDecimal montoRestante = totalAbonos;
            int cuotasActualizadas = 0;
            
            for (Cuota cuota : todasLasCuotas) {
                if (montoRestante.compareTo(BigDecimal.ZERO) <= 0) {
                    // Si ya no hay monto restante, marcar las cuotas restantes como pendientes si estaban pagadas por error
                    if (cuota.getEstado() == Cuota.EstadoCuota.PAGADA && cuota.getFechaPago() == null) {
                        cuota.setEstado(Cuota.EstadoCuota.PENDIENTE);
                        cuotaRepository.save(cuota);
                    }
                    continue;
                }
                
                BigDecimal montoCuota = cuota.getMonto();
                
                // Usar comparación con tolerancia para evitar problemas de precisión
                BigDecimal tolerancia = montoCuota.multiply(new BigDecimal("0.01")); // 1% de tolerancia
                BigDecimal montoMinimo = montoCuota.subtract(tolerancia);
                
                if (montoRestante.compareTo(montoMinimo) >= 0) {
                    // Si la cuota no está marcada como pagada, actualizarla
                    if (cuota.getEstado() != Cuota.EstadoCuota.PAGADA) {
                        cuota.setEstado(Cuota.EstadoCuota.PAGADA);
                        
                        // Buscar la fecha del abono más reciente que cubrió esta cuota
                        // Para simplificar, usamos la fecha del último abono si hay alguno
                        if (!abonos.isEmpty()) {
                            LocalDate fechaUltimoAbono = abonos.get(abonos.size() - 1).getFechaAbono();
                            cuota.setFechaPago(fechaUltimoAbono);
                        }
                        
                        cuotaRepository.save(cuota);
                        cuotasActualizadas++;
                        log.info("Cuota #{} marcada como PAGADA", cuota.getNumeroCuota());
                    }
                    
                    montoRestante = montoRestante.subtract(montoCuota);
                    
                    // Si el monto restante es negativo, ajustarlo a cero
                    if (montoRestante.compareTo(BigDecimal.ZERO) < 0) {
                        montoRestante = BigDecimal.ZERO;
                    }
                } else {
                    // Si la cuota estaba marcada como pagada pero ya no hay monto suficiente, corregirla
                    if (cuota.getEstado() == Cuota.EstadoCuota.PAGADA) {
                        cuota.setEstado(Cuota.EstadoCuota.PENDIENTE);
                        cuota.setFechaPago(null);
                        cuotaRepository.save(cuota);
                        log.info("Cuota #{} corregida a PENDIENTE (monto insuficiente)", cuota.getNumeroCuota());
                    }
                    break;
                }
            }
            
            log.info("Sincronización de cuotas completada. Cuotas actualizadas: {}", cuotasActualizadas);
            
        } catch (Exception e) {
            log.error("Error al sincronizar cuotas con abonos para préstamo {}: {}", prestamo.getId(), e.getMessage(), e);
            // No lanzamos la excepción para que el abono se registre aunque haya error en actualizar cuotas
        }
    }
    
    @Transactional
    public void eliminarPrestamo(Long id) {
        if (!prestamoRepository.existsById(id)) {
            throw new RuntimeException("Préstamo no encontrado");
        }
        prestamoRepository.deleteById(id);
        log.info("Préstamo eliminado: ID {}", id);
    }
    
    private LocalDate calcularFechaVencimiento(LocalDate fechaInicio, int numeroCuotas, Prestamo.FrecuenciaPago frecuencia) {
        LocalDate fechaVencimiento = fechaInicio;
        
        switch (frecuencia) {
            case DIARIO:
                fechaVencimiento = fechaInicio.plusDays(numeroCuotas - 1);
                break;
            case SEMANAL:
                fechaVencimiento = fechaInicio.plusWeeks(numeroCuotas - 1);
                break;
            case QUINCENAL:
                fechaVencimiento = fechaInicio.plusWeeks((numeroCuotas - 1) * 2);
                break;
            case MENSUAL:
                fechaVencimiento = fechaInicio.plusMonths(numeroCuotas - 1);
                break;
        }
        
        return fechaVencimiento;
    }
    
    private void crearCuotas(Prestamo prestamo) {
        BigDecimal montoCuota = prestamo.getMontoPrestado()
            .divide(new BigDecimal(prestamo.getNumeroCuotas()), 2, RoundingMode.HALF_UP);
        
        LocalDate fechaInicio = prestamo.getFechaInicio();
        
        for (int i = 0; i < prestamo.getNumeroCuotas(); i++) {
            Cuota cuota = new Cuota();
            cuota.setPrestamo(prestamo);
            cuota.setNumeroCuota(i + 1);
            cuota.setMonto(montoCuota);
            cuota.setEstado(Cuota.EstadoCuota.PENDIENTE);
            
            // Calcular fecha de vencimiento de la cuota
            LocalDate fechaVencimiento;
            switch (prestamo.getFrecuenciaPago()) {
                case DIARIO:
                    fechaVencimiento = fechaInicio.plusDays(i);
                    break;
                case SEMANAL:
                    fechaVencimiento = fechaInicio.plusWeeks(i);
                    break;
                case QUINCENAL:
                    fechaVencimiento = fechaInicio.plusWeeks(i * 2);
                    break;
                case MENSUAL:
                    fechaVencimiento = fechaInicio.plusMonths(i);
                    break;
                default:
                    fechaVencimiento = fechaInicio.plusMonths(i);
            }
            cuota.setFechaVencimiento(fechaVencimiento);
            
            cuotaRepository.save(cuota);
        }
    }
}

