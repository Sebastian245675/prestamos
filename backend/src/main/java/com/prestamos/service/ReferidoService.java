package com.prestamos.service;

import com.prestamos.entity.Prestamo;
import com.prestamos.entity.Referido;
import com.prestamos.entity.Usuario;
import com.prestamos.repository.PrestamoRepository;
import com.prestamos.repository.ReferidoRepository;
import com.prestamos.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReferidoService {
    
    private final ReferidoRepository referidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final PrestamoRepository prestamoRepository;
    
    /**
     * Genera un código único de referido para un usuario
     */
    public String generarCodigoReferido(Long usuarioId) {
        String codigo = "REF-" + String.format("%06d", usuarioId) + "-" + 
                       UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return codigo;
    }
    
    /**
     * Obtiene o crea el código de referido de un usuario
     */
    @Transactional(readOnly = true)
    public String obtenerCodigoReferido(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        if (usuario.getCodigoReferido() == null || usuario.getCodigoReferido().isEmpty()) {
            // Generar código si no existe
            String codigo = generarCodigoReferido(usuarioId);
            usuario.setCodigoReferido(codigo);
            usuarioRepository.save(usuario);
            return codigo;
        }
        
        return usuario.getCodigoReferido();
    }
    
    /**
     * Procesa un referido cuando alguien se registra con un código
     */
    @Transactional
    public Referido procesarReferido(Long referidoId, String codigoReferido) {
        // Buscar el referidor por código
        Optional<Referido> referidoExistente = referidoRepository.findByCodigoReferido(codigoReferido);
        if (referidoExistente.isPresent()) {
            throw new RuntimeException("Este código de referido ya fue usado");
        }
        
        Usuario referidor = usuarioRepository.findByCodigoReferido(codigoReferido)
            .orElseThrow(() -> new RuntimeException("Código de referido inválido"));
        
        Usuario referido = usuarioRepository.findById(referidoId)
            .orElseThrow(() -> new RuntimeException("Usuario referido no encontrado"));
        
        // Verificar que no sea auto-referido
        if (referidor.getId().equals(referidoId)) {
            throw new RuntimeException("No puedes referirte a ti mismo");
        }
        
        // Verificar que el usuario no tenga ya un referidor
        Optional<Referido> yaReferido = referidoRepository.findByReferidoId(referidoId);
        if (yaReferido.isPresent()) {
            throw new RuntimeException("Este usuario ya tiene un referidor");
        }
        
        // Crear el registro de referido
        Referido nuevoReferido = new Referido();
        nuevoReferido.setReferidor(referidor);
        nuevoReferido.setReferido(referido);
        nuevoReferido.setCodigoReferido(codigoReferido);
        nuevoReferido.setFechaRegistro(LocalDate.now());
        nuevoReferido.setActivo(false); // Se activará cuando tenga préstamos
        
        return referidoRepository.save(nuevoReferido);
    }
    
    /**
     * Obtiene todos los referidos de un usuario
     */
    @Transactional(readOnly = true)
    public List<Referido> obtenerReferidos(Long referidorId) {
        return referidoRepository.findByReferidorIdOrderByFechaRegistroDesc(referidorId);
    }
    
    /**
     * Actualiza el estado activo y monto generado de los referidos
     */
    @Transactional
    public void actualizarEstadoReferidos(Long referidoId) {
        Optional<Referido> referidoOpt = referidoRepository.findByReferidoId(referidoId);
        if (referidoOpt.isEmpty()) {
            return;
        }
        
        Referido referido = referidoOpt.get();
        
        // Obtener todos los préstamos del referido
        List<Prestamo> prestamos = prestamoRepository.findByPrestamistaIdOrderByFechaCreacionDesc(referidoId);
        
        // Calcular monto total generado
        BigDecimal montoGenerado = prestamos.stream()
            .map(Prestamo::getMontoPrestado)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Verificar si tiene préstamos activos
        boolean tieneActivos = prestamos.stream()
            .anyMatch(p -> p.getEstado() == Prestamo.EstadoPrestamo.ACTIVO);
        
        referido.setMontoGenerado(montoGenerado);
        referido.setActivo(tieneActivos);
        
        referidoRepository.save(referido);
    }
    
    /**
     * Calcula estadísticas de referidos
     */
    @Transactional(readOnly = true)
    public java.util.Map<String, Object> obtenerEstadisticas(Long referidorId) {
        List<Referido> referidos = referidoRepository.findByReferidorIdOrderByFechaRegistroDesc(referidorId);
        
        long totalReferidos = referidos.size();
        long referidosActivos = referidos.stream()
            .filter(Referido::getActivo)
            .count();
        
        BigDecimal totalRecompensas = calcularRecompensas(referidos);
        long recompensasPendientes = referidos.stream()
            .filter(r -> r.getMontoGenerado().compareTo(BigDecimal.ZERO) > 0 && !r.getActivo())
            .count();
        
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalReferidos", totalReferidos);
        stats.put("referidosActivos", referidosActivos);
        stats.put("totalRecompensas", totalRecompensas);
        stats.put("recompensasPendientes", recompensasPendientes);
        
        return stats;
    }
    
    /**
     * Calcula las recompensas basadas en los referidos
     */
    private BigDecimal calcularRecompensas(List<Referido> referidos) {
        BigDecimal total = BigDecimal.ZERO;
        
        // Primer referido: $50,000
        if (referidos.size() >= 1) {
            total = total.add(new BigDecimal("50000"));
        }
        
        // Por cada referido activo: $100,000
        long activos = referidos.stream().filter(Referido::getActivo).count();
        total = total.add(new BigDecimal("100000").multiply(new BigDecimal(activos)));
        
        // 5% del monto generado por referidos
        BigDecimal montoTotalGenerado = referidos.stream()
            .map(Referido::getMontoGenerado)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal porcentaje = montoTotalGenerado.multiply(new BigDecimal("0.05"));
        total = total.add(porcentaje);
        
        // Bonus mensual por 5+ referidos activos
        if (activos >= 5) {
            total = total.add(new BigDecimal("200000"));
        }
        
        return total;
    }
}

