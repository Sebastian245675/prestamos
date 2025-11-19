package com.prestamos.service;

import com.prestamos.entity.Suscripcion;
import com.prestamos.entity.Usuario;
import com.prestamos.repository.SuscripcionRepository;
import com.prestamos.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SuscripcionService {
    
    private final SuscripcionRepository suscripcionRepository;
    private final UsuarioRepository usuarioRepository;
    
    /**
     * Crea una nueva suscripción para un usuario
     */
    @Transactional
    @CacheEvict(value = "suscripciones", key = "#usuarioId")
    public Suscripcion crearSuscripcion(Long usuarioId, String tipoSuscripcion, BigDecimal monto) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // Cancelar suscripciones anteriores activas
        Optional<Suscripcion> suscripcionActiva = suscripcionRepository
            .findFirstByUsuarioIdAndEstadoOrderByFechaCreacionDesc(usuarioId, Suscripcion.EstadoSuscripcion.ACTIVA);
        
        if (suscripcionActiva.isPresent()) {
            Suscripcion anterior = suscripcionActiva.get();
            anterior.setEstado(Suscripcion.EstadoSuscripcion.CANCELADA);
            suscripcionRepository.save(anterior);
            log.info("Suscripción anterior cancelada para usuario: {}", usuarioId);
        }
        
        // Crear nueva suscripción
        Suscripcion suscripcion = new Suscripcion();
        suscripcion.setUsuario(usuario);
        suscripcion.setTipo(tipoSuscripcion.equals("MENSUAL") 
            ? Suscripcion.TipoSuscripcion.MENSUAL 
            : Suscripcion.TipoSuscripcion.ANUAL);
        suscripcion.setMonto(monto);
        
        LocalDate fechaInicio = LocalDate.now();
        LocalDate fechaVencimiento;
        
        if (tipoSuscripcion.equals("ANUAL")) {
            fechaVencimiento = fechaInicio.plusYears(1);
        } else {
            fechaVencimiento = fechaInicio.plusMonths(1);
        }
        
        suscripcion.setFechaInicio(fechaInicio);
        suscripcion.setFechaVencimiento(fechaVencimiento);
        suscripcion.setEstado(Suscripcion.EstadoSuscripcion.ACTIVA);
        
        suscripcion = suscripcionRepository.save(suscripcion);
        
        log.info("Suscripción creada: ID {} para usuario {} - Tipo: {} - Vence: {}", 
            suscripcion.getId(), usuarioId, tipoSuscripcion, fechaVencimiento);
        
        return suscripcion;
    }
    
    /**
     * Obtiene la suscripción activa de un usuario (con caché)
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "suscripciones", key = "#usuarioId")
    public Optional<Suscripcion> obtenerSuscripcionActiva(Long usuarioId) {
        return suscripcionRepository
            .findFirstByUsuarioIdAndEstadoOrderByFechaCreacionDesc(usuarioId, Suscripcion.EstadoSuscripcion.ACTIVA);
    }
    
    /**
     * Verifica si un usuario tiene suscripción activa (método optimizado para el filtro)
     * Retorna true si tiene suscripción activa y no vencida
     * Usa el caché de obtenerSuscripcionActiva internamente para mejorar rendimiento
     */
    @Transactional(readOnly = true)
    public boolean tieneSuscripcionActiva(Long usuarioId) {
        // Usar método con caché para evitar consultas repetidas
        Optional<Suscripcion> suscripcionOpt = obtenerSuscripcionActiva(usuarioId);
        
        LocalDate hoy = LocalDate.now();
        
        if (suscripcionOpt.isPresent()) {
            Suscripcion suscripcion = suscripcionOpt.get();
            
            // Verificar que el estado sea ACTIVA y que no esté vencida
            if (suscripcion.getEstado() == Suscripcion.EstadoSuscripcion.ACTIVA &&
                suscripcion.getFechaVencimiento() != null &&
                !suscripcion.getFechaVencimiento().isBefore(hoy)) {
                return true;
            }
            // Si está vencida, retornar false inmediatamente (no verificar usuario)
            return false;
        }
        
        // Si no hay suscripción activa en la tabla, verificar en el usuario (fallback rápido)
        // Solo hacer una consulta ligera por ID, sin cargar relaciones
        try {
            Usuario usuario = usuarioRepository.findById(usuarioId).orElse(null);
            if (usuario != null && 
                usuario.getSuscripcionActiva() != null &&
                usuario.getSuscripcionActiva() &&
                usuario.getFechaVencimientoSuscripcion() != null &&
                !usuario.getFechaVencimientoSuscripcion().isBefore(hoy)) {
                return true;
            }
        } catch (Exception e) {
            log.warn("Error al verificar suscripción del usuario {}: {}", usuarioId, e.getMessage());
        }
        
        return false;
    }
    
    /**
     * Sincroniza el estado de suscripción del usuario con la tabla de suscripciones
     * Solo actualiza si es necesario (evita escrituras innecesarias)
     */
    @Transactional
    @CacheEvict(value = "suscripciones", key = "#usuarioId")
    public void sincronizarEstadoSuscripcion(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        Optional<Suscripcion> suscripcionOpt = suscripcionRepository
            .findFirstByUsuarioIdAndEstadoOrderByFechaCreacionDesc(usuarioId, Suscripcion.EstadoSuscripcion.ACTIVA);
        
        LocalDate hoy = LocalDate.now();
        boolean deberiaEstarActiva = false;
        
        if (suscripcionOpt.isPresent()) {
            Suscripcion suscripcion = suscripcionOpt.get();
            
            // Verificar si está vencida
            if (suscripcion.getFechaVencimiento() != null &&
                suscripcion.getFechaVencimiento().isBefore(hoy)) {
                // Marcar como vencida si no lo está
                if (suscripcion.getEstado() == Suscripcion.EstadoSuscripcion.ACTIVA) {
                    suscripcion.setEstado(Suscripcion.EstadoSuscripcion.VENCIDA);
                    suscripcionRepository.save(suscripcion);
                }
            } else if (suscripcion.getEstado() == Suscripcion.EstadoSuscripcion.ACTIVA) {
                deberiaEstarActiva = true;
            }
        }
        
        // Actualizar estado del usuario solo si cambió
        if (usuario.getSuscripcionActiva() != deberiaEstarActiva) {
            usuario.setSuscripcionActiva(deberiaEstarActiva);
            usuarioRepository.save(usuario);
        }
    }
    
    /**
     * Obtiene la última suscripción de un usuario (activa o no)
     */
    @Transactional(readOnly = true)
    public Optional<Suscripcion> obtenerUltimaSuscripcion(Long usuarioId) {
        return suscripcionRepository.findFirstByUsuarioIdOrderByFechaCreacionDesc(usuarioId);
    }
    
    /**
     * Verifica y actualiza el estado de las suscripciones vencidas
     */
    @Transactional
    public void verificarSuscripcionesVencidas() {
        LocalDate hoy = LocalDate.now();
        suscripcionRepository.findAll().stream()
            .filter(s -> s.getEstado() == Suscripcion.EstadoSuscripcion.ACTIVA)
            .filter(s -> s.getFechaVencimiento().isBefore(hoy))
            .forEach(suscripcion -> {
                suscripcion.setEstado(Suscripcion.EstadoSuscripcion.VENCIDA);
                suscripcionRepository.save(suscripcion);
                
                // Actualizar usuario
                Usuario usuario = suscripcion.getUsuario();
                usuario.setSuscripcionActiva(false);
                usuarioRepository.save(usuario);
                
                log.info("Suscripción {} marcada como vencida para usuario {}", 
                    suscripcion.getId(), usuario.getId());
            });
    }
}

