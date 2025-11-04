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
import java.util.List;

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
        if (request.getMonto().compareTo(prestamo.getSaldoPendiente()) > 0) {
            throw new RuntimeException("El monto del abono no puede ser mayor al saldo pendiente");
        }
        
        // Crear abono
        Abono abono = new Abono();
        abono.setPrestamo(prestamo);
        abono.setUsuario(usuario);
        abono.setMonto(request.getMonto());
        abono.setFechaAbono(request.getFechaAbono() != null ? request.getFechaAbono() : LocalDate.now());
        abono.setObservaciones(request.getObservaciones());
        
        abono = abonoRepository.save(abono);
        
        // Actualizar préstamo
        BigDecimal nuevoSaldo = prestamo.getSaldoPendiente().subtract(request.getMonto());
        prestamo.setSaldoPendiente(nuevoSaldo);
        
        // Calcular cuotas pagadas
        BigDecimal montoPorCuota = prestamo.getMontoPrestado()
            .divide(new BigDecimal(prestamo.getNumeroCuotas()), 2, RoundingMode.HALF_UP);
        int nuevasCuotasPagadas = prestamo.getMontoPrestado()
            .subtract(nuevoSaldo)
            .divide(montoPorCuota, 0, RoundingMode.DOWN)
            .intValue();
        prestamo.setCuotasPagadas(Math.min(nuevasCuotasPagadas, prestamo.getNumeroCuotas()));
        
        // Actualizar estado
        if (nuevoSaldo.compareTo(BigDecimal.ZERO) <= 0) {
            prestamo.setEstado(Prestamo.EstadoPrestamo.FINALIZADO);
            prestamo.setCuotasPagadas(prestamo.getNumeroCuotas());
        } else if (prestamo.getFechaVencimiento().isBefore(LocalDate.now()) && 
                   prestamo.getEstado() == Prestamo.EstadoPrestamo.ACTIVO) {
            prestamo.setEstado(Prestamo.EstadoPrestamo.VENCIDO);
        }
        
        prestamoRepository.save(prestamo);
        
        log.info("Abono registrado: ID {} de {} para préstamo {}", 
            abono.getId(), request.getMonto(), prestamoId);
        
        return abono;
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

