package com.prestamos.service;

import com.prestamos.entity.Suscripcion;
import com.prestamos.entity.Usuario;
import com.prestamos.repository.SuscripcionRepository;
import com.prestamos.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
     * Obtiene la suscripción activa de un usuario
     */
    @Transactional(readOnly = true)
    public Optional<Suscripcion> obtenerSuscripcionActiva(Long usuarioId) {
        return suscripcionRepository
            .findFirstByUsuarioIdAndEstadoOrderByFechaCreacionDesc(usuarioId, Suscripcion.EstadoSuscripcion.ACTIVA);
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

