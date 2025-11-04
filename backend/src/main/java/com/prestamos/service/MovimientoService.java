package com.prestamos.service;

import com.prestamos.dto.MovimientoRequest;
import com.prestamos.entity.Movimiento;
import com.prestamos.entity.Usuario;
import com.prestamos.repository.MovimientoRepository;
import com.prestamos.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MovimientoService {
    
    private final MovimientoRepository movimientoRepository;
    private final UsuarioRepository usuarioRepository;
    
    @Transactional
    public Movimiento crearMovimiento(Long usuarioId, MovimientoRequest request) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        Movimiento movimiento = new Movimiento();
        movimiento.setUsuario(usuario);
        movimiento.setTipo(Movimiento.TipoMovimiento.valueOf(request.getTipo()));
        movimiento.setMonto(request.getMonto());
        movimiento.setDescripcion(request.getDescripcion());
        movimiento.setFecha(request.getFecha());
        movimiento.setObservaciones(request.getObservaciones());
        
        return movimientoRepository.save(movimiento);
    }
    
    public List<Movimiento> obtenerMovimientosPorUsuario(Long usuarioId) {
        return movimientoRepository.findByUsuarioId(usuarioId);
    }
    
    public List<Movimiento> obtenerMovimientosPorUsuarioYFecha(
            Long usuarioId, LocalDate fechaInicio, LocalDate fechaFin) {
        return movimientoRepository.findByUsuarioIdAndFechaBetween(usuarioId, fechaInicio, fechaFin);
    }
    
    public Map<String, Object> obtenerResumenMovimientos(Long usuarioId) {
        BigDecimal totalEntradas = movimientoRepository.sumMontoByUsuarioIdAndTipo(
            usuarioId, Movimiento.TipoMovimiento.ENTRADA);
        BigDecimal totalSalidas = movimientoRepository.sumMontoByUsuarioIdAndTipo(
            usuarioId, Movimiento.TipoMovimiento.SALIDA);
        
        BigDecimal saldo = (totalEntradas != null ? totalEntradas : BigDecimal.ZERO)
            .subtract(totalSalidas != null ? totalSalidas : BigDecimal.ZERO);
        
        Map<String, Object> resumen = new HashMap<>();
        resumen.put("totalEntradas", totalEntradas != null ? totalEntradas : BigDecimal.ZERO);
        resumen.put("totalSalidas", totalSalidas != null ? totalSalidas : BigDecimal.ZERO);
        resumen.put("saldo", saldo);
        
        return resumen;
    }
    
    @Transactional
    public void eliminarMovimiento(Long movimientoId, Long usuarioId) {
        Movimiento movimiento = movimientoRepository.findById(movimientoId)
            .orElseThrow(() -> new RuntimeException("Movimiento no encontrado"));
        
        if (!movimiento.getUsuario().getId().equals(usuarioId)) {
            throw new RuntimeException("No tienes permiso para eliminar este movimiento");
        }
        
        movimientoRepository.delete(movimiento);
    }
}

