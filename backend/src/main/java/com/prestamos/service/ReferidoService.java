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
     * Formato: REF-XXXXXX-YYYYYY donde XXXXXX es el ID y YYYYYY es un código aleatorio
     * El código es determinístico basado en el usuarioId para mantener consistencia
     */
    private String generarCodigoReferido(Long usuarioId) {
        int maxIntentos = 10;
        int intento = 0;
        
        // Usar el ID del usuario como semilla para hacer el código más determinístico
        // pero aún único
        String baseCodigo = "REF-" + String.format("%06d", usuarioId) + "-";
        long semilla = usuarioId * 31L; // Hash simple para generar parte del código
        
        while (intento < maxIntentos) {
            // Generar código determinístico basado en el ID del usuario
            String codigoAleatorio = generarCodigoAleatorioConSemilla(semilla + intento);
            String codigo = baseCodigo + codigoAleatorio;
            
            // Verificar que el código sea único
            try {
                Optional<Usuario> existe = usuarioRepository.findByCodigoReferido(codigo);
                if (existe.isEmpty()) {
                    return codigo;
                }
            } catch (Exception e) {
                log.warn("Error al verificar código único, intentando otro: {}", e.getMessage());
            }
            
            intento++;
        }
        
        // Si hay colisión después de varios intentos, usar UUID pero basado en el ID
        try {
            String uuid = UUID.nameUUIDFromBytes((usuarioId.toString() + System.currentTimeMillis()).getBytes())
                    .toString().replace("-", "").substring(0, 8).toUpperCase();
            return baseCodigo + uuid;
        } catch (Exception e) {
            log.warn("Error al generar UUID basado en ID, usando método alternativo: {}", e.getMessage());
            // Método alternativo: usar hash del ID del usuario
            String hash = String.valueOf(Math.abs(usuarioId.hashCode()));
            String suffix = hash.length() >= 8 ? hash.substring(0, 8) : hash + "X".repeat(8 - hash.length());
            return baseCodigo + suffix.toUpperCase();
        }
    }
    
    /**
     * Genera un código aleatorio de 8 caracteres alfanuméricos
     */
    private String generarCodigoAleatorio() {
        String chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
        StringBuilder codigo = new StringBuilder(8);
        java.util.Random random = new java.util.Random();
        
        for (int i = 0; i < 8; i++) {
            codigo.append(chars.charAt(random.nextInt(chars.length())));
        }
        
        return codigo.toString();
    }
    
    /**
     * Genera un código aleatorio de 8 caracteres alfanuméricos con semilla
     * Esto hace que el código sea más determinístico para el mismo usuario
     */
    private String generarCodigoAleatorioConSemilla(long semilla) {
        String chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
        StringBuilder codigo = new StringBuilder(8);
        java.util.Random random = new java.util.Random(semilla);
        
        for (int i = 0; i < 8; i++) {
            codigo.append(chars.charAt(random.nextInt(chars.length())));
        }
        
        return codigo.toString();
    }
    
    /**
     * Obtiene o crea el código de referido de un usuario
     * El código es único y persistente para cada usuario
     */
    @Transactional
    public String obtenerCodigoReferido(Long usuarioId) {
        try {
            Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + usuarioId));
            
            // Si el usuario ya tiene un código, retornarlo (persistente)
            if (usuario.getCodigoReferido() != null && !usuario.getCodigoReferido().trim().isEmpty()) {
                log.debug("Código de referido existente para usuario {}: {}", usuarioId, usuario.getCodigoReferido());
                return usuario.getCodigoReferido();
            }
            
            // Generar código único solo si no existe
            log.info("Generando nuevo código de referido para usuario {}", usuarioId);
            String codigo = generarCodigoReferido(usuarioId);
            usuario.setCodigoReferido(codigo);
            
            // Guardar con flush para asegurar persistencia inmediata
            usuario = usuarioRepository.saveAndFlush(usuario);
            
            log.info("Código de referido generado y guardado para usuario {}: {}", usuarioId, codigo);
            return codigo;
            
        } catch (Exception e) {
            log.error("Error al obtener/generar código de referido para usuario {}: {}", usuarioId, e.getMessage(), e);
            throw new RuntimeException("Error al obtener código de referido: " + e.getMessage(), e);
        }
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
            .filter(r -> r.getActivo() != null && r.getActivo())
            .count();
        
        BigDecimal totalRecompensas = calcularRecompensas(referidos);
        long recompensasPendientes = referidos.stream()
            .filter(r -> {
                BigDecimal monto = r.getMontoGenerado();
                if (monto == null) return false;
                Boolean activo = r.getActivo();
                return monto.compareTo(BigDecimal.ZERO) > 0 && (activo == null || !activo);
            })
            .count();
        
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalReferidos", totalReferidos);
        stats.put("referidosActivos", referidosActivos);
        // Convertir BigDecimal a double para serialización JSON correcta
        stats.put("totalRecompensas", totalRecompensas.doubleValue());
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
        long activos = referidos.stream()
            .filter(r -> r.getActivo() != null && r.getActivo())
            .count();
        total = total.add(new BigDecimal("100000").multiply(new BigDecimal(activos)));
        
        // 5% del monto generado por referidos
        BigDecimal montoTotalGenerado = referidos.stream()
            .map(Referido::getMontoGenerado)
            .filter(m -> m != null)
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

