package com.prestamos.service;

import com.prestamos.dto.AbonoRequest;
import com.prestamos.dto.PrestamoRequest;
import com.prestamos.entity.*;
import com.prestamos.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class PrestamoService {
    
    private final PrestamoRepository prestamoRepository;
    private final UsuarioRepository usuarioRepository;
    private final AbonoRepository abonoRepository;
    private final CuotaRepository cuotaRepository;
    
    @Transactional
    public Prestamo crearPrestamo(Long prestamistaId, PrestamoRequest request) {
        Usuario prestamista = usuarioRepository.findById(prestamistaId)
            .orElseThrow(() -> new RuntimeException("Prestamista no encontrado"));
        
        Prestamo prestamo = new Prestamo();
        prestamo.setPrestamista(prestamista);
        prestamo.setNombreCliente(request.getNombreCliente());
        prestamo.setDireccion(request.getDireccion());
        prestamo.setTelefono(request.getTelefono());
        prestamo.setEmail(request.getEmail());
        prestamo.setMontoPrestado(request.getMontoPrestado());
        prestamo.setSaldoPendiente(request.getMontoPrestado());
        prestamo.setNumeroCuotas(request.getNumeroCuotas());
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
        
        return prestamo;
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
        
        List<Cuota> cuotas = IntStream.range(0, prestamo.getNumeroCuotas())
            .mapToObj(i -> {
                Cuota cuota = new Cuota();
                cuota.setPrestamo(prestamo);
                cuota.setNumeroCuota(i + 1);
                cuota.setMonto(montoCuota);
                cuota.setFechaVencimiento(calcularFechaVencimientoCuota(
                    prestamo.getFechaInicio(), i, prestamo.getFrecuenciaPago()));
                cuota.setEstado(Cuota.EstadoCuota.PENDIENTE);
                return cuota;
            })
            .collect(Collectors.toList());
        
        cuotaRepository.saveAll(cuotas);
    }
    
    private LocalDate calcularFechaVencimientoCuota(LocalDate fechaInicio, int numeroCuota, Prestamo.FrecuenciaPago frecuencia) {
        switch (frecuencia) {
            case DIARIO:
                return fechaInicio.plusDays(numeroCuota);
            case SEMANAL:
                return fechaInicio.plusWeeks(numeroCuota);
            case QUINCENAL:
                return fechaInicio.plusWeeks(numeroCuota * 2);
            case MENSUAL:
                return fechaInicio.plusMonths(numeroCuota);
            default:
                return fechaInicio;
        }
    }
    
    public List<Prestamo> obtenerPrestamosPorPrestamista(Long prestamistaId) {
        return prestamoRepository.findByPrestamistaId(prestamistaId);
    }
    
    public List<Prestamo> obtenerPrestamosPorCobrador(Long cobradorId) {
        return prestamoRepository.findByCobradorId(cobradorId);
    }
    
    @Transactional
    public Abono registrarAbono(Long prestamoId, Long usuarioId, AbonoRequest request) {
        Prestamo prestamo = prestamoRepository.findById(prestamoId)
            .orElseThrow(() -> new RuntimeException("Préstamo no encontrado"));
        
        Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        Abono abono = new Abono();
        abono.setPrestamo(prestamo);
        abono.setUsuario(usuario);
        abono.setMonto(request.getMonto());
        abono.setFechaAbono(request.getFechaAbono());
        abono.setObservaciones(request.getObservaciones());
        
        abono = abonoRepository.save(abono);
        
        // Enviar comprobante por email si se solicita
        if (request.getEnviarComprobante() != null && request.getEnviarComprobante() && 
            prestamo.getEmail() != null && !prestamo.getEmail().isEmpty()) {
            // TODO: Implementar envío de email con comprobante
            // emailService.enviarComprobante(prestamo, abono);
        }
        
        // Actualizar saldo pendiente
        BigDecimal nuevoSaldo = prestamo.getSaldoPendiente().subtract(request.getMonto());
        prestamo.setSaldoPendiente(nuevoSaldo.max(BigDecimal.ZERO));
        
        // Actualizar cuotas pagadas
        actualizarCuotas(prestamo, request.getMonto());
        
        // Actualizar estado del préstamo
        actualizarEstadoPrestamo(prestamo);
        
        prestamoRepository.save(prestamo);
        
        return abono;
    }
    
    private void actualizarCuotas(Prestamo prestamo, BigDecimal montoAbono) {
        List<Cuota> cuotas = cuotaRepository.findByPrestamoId(prestamo.getId())
            .stream()
            .sorted((a, b) -> a.getNumeroCuota().compareTo(b.getNumeroCuota()))
            .collect(Collectors.toList());
        
        BigDecimal montoRestante = montoAbono;
        
        for (Cuota cuota : cuotas) {
            if (cuota.getEstado() == Cuota.EstadoCuota.PAGADA) {
                continue;
            }
            
            if (montoRestante.compareTo(cuota.getMonto()) >= 0) {
                cuota.setEstado(Cuota.EstadoCuota.PAGADA);
                cuota.setFechaPago(LocalDate.now());
                montoRestante = montoRestante.subtract(cuota.getMonto());
            } else {
                break;
            }
        }
        
        cuotaRepository.saveAll(cuotas);
        
        // Actualizar contador de cuotas pagadas
        long cuotasPagadas = cuotas.stream()
            .filter(c -> c.getEstado() == Cuota.EstadoCuota.PAGADA)
            .count();
        prestamo.setCuotasPagadas((int) cuotasPagadas);
    }
    
    private void actualizarEstadoPrestamo(Prestamo prestamo) {
        if (prestamo.getSaldoPendiente().compareTo(BigDecimal.ZERO) <= 0) {
            prestamo.setEstado(Prestamo.EstadoPrestamo.FINALIZADO);
        } else if (LocalDate.now().isAfter(prestamo.getFechaVencimiento())) {
            prestamo.setEstado(Prestamo.EstadoPrestamo.VENCIDO);
        } else {
            prestamo.setEstado(Prestamo.EstadoPrestamo.ACTIVO);
        }
    }
    
    public List<String> obtenerZonas(Long prestamistaId) {
        return prestamoRepository.findByPrestamistaId(prestamistaId)
            .stream()
            .map(Prestamo::getZona)
            .distinct()
            .collect(Collectors.toList());
    }
}

