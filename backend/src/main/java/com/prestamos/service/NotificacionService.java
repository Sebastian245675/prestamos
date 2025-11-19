package com.prestamos.service;

import com.prestamos.entity.Notificacion;
import com.prestamos.entity.Usuario;
import com.prestamos.repository.NotificacionRepository;
import com.prestamos.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificacionService {
    
    private final NotificacionRepository notificacionRepository;
    private final UsuarioRepository usuarioRepository;
    private final com.prestamos.repository.PrestamoRepository prestamoRepository;
    private final com.prestamos.repository.CuotaRepository cuotaRepository;
    
    @Transactional
    public Notificacion crearNotificacion(Long usuarioId, String tipo, String titulo, 
                                          String mensaje, String link, Long prestamoId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        Notificacion notificacion = new Notificacion();
        notificacion.setUsuario(usuario);
        notificacion.setTipo(tipo);
        notificacion.setTitulo(titulo);
        notificacion.setMensaje(mensaje);
        notificacion.setLink(link);
        notificacion.setPrestamoId(prestamoId);
        notificacion.setLeida(false);
        
        return notificacionRepository.save(notificacion);
    }
    
    public List<Notificacion> obtenerNotificaciones(Long usuarioId) {
        return notificacionRepository.findByUsuarioIdOrderByFechaCreacionDesc(usuarioId);
    }
    
    public Long contarNoLeidas(Long usuarioId) {
        return notificacionRepository.countByUsuarioIdAndLeida(usuarioId, false);
    }
    
    @Transactional
    public void marcarComoLeida(Long notificacionId, Long usuarioId) {
        Notificacion notificacion = notificacionRepository.findById(notificacionId)
            .orElseThrow(() -> new RuntimeException("Notificación no encontrada"));
        
        if (!notificacion.getUsuario().getId().equals(usuarioId)) {
            throw new RuntimeException("No autorizado");
        }
        
        notificacion.setLeida(true);
        notificacionRepository.save(notificacion);
    }
    
    @Transactional
    public void marcarTodasComoLeidas(Long usuarioId) {
        notificacionRepository.marcarTodasComoLeidas(usuarioId);
    }
    
    // Crear notificación cuando se registra un abono
    public void notificarAbonoRegistrado(Long usuarioId, Long prestamoId, BigDecimal monto, String nombreCliente) {
        String mensaje = String.format("Se registró un abono de $%,.0f para el préstamo de %s", 
            monto, nombreCliente);
        crearNotificacion(usuarioId, "success", "Abono Registrado", mensaje, 
            "/prestamos/" + prestamoId, prestamoId);
    }
    
    // Verificar préstamos vencidos y crear notificaciones
    @Scheduled(cron = "0 0 8 * * ?") // Todos los días a las 8 AM
    @Transactional
    public void verificarPrestamosVencidos() {
        log.info("Verificando préstamos vencidos...");
        LocalDate hoy = LocalDate.now();
        
        List<com.prestamos.entity.Prestamo> prestamosVencidos = prestamoRepository.findAll().stream()
            .filter(p -> p.getEstado() == com.prestamos.entity.Prestamo.EstadoPrestamo.ACTIVO)
            .filter(p -> p.getFechaVencimiento().isBefore(hoy))
            .filter(p -> p.getRecordatoriosActivos())
            .collect(java.util.stream.Collectors.toList());
        
        for (com.prestamos.entity.Prestamo prestamo : prestamosVencidos) {
            // Verificar si ya existe una notificación reciente para este préstamo vencido
            List<Notificacion> notificacionesExistentes = notificacionRepository
                .findByUsuarioIdOrderByFechaCreacionDesc(prestamo.getPrestamista().getId());
            
            boolean yaNotificado = notificacionesExistentes.stream()
                .anyMatch(n -> n.getPrestamoId() != null && 
                              n.getPrestamoId().equals(prestamo.getId()) &&
                              n.getTipo().equals("warning") &&
                              n.getTitulo().equals("Préstamo Vencido") &&
                              n.getFechaCreacion().isAfter(LocalDateTime.now().minusDays(1)));
            
            if (!yaNotificado) {
                String mensaje = String.format("El préstamo de %s está vencido", prestamo.getNombreCliente());
                crearNotificacion(prestamo.getPrestamista().getId(), "warning", 
                    "Préstamo Vencido", mensaje, "/prestamos/" + prestamo.getId(), prestamo.getId());
            }
        }
        
        log.info("Verificación de préstamos vencidos completada. Encontrados: {}", prestamosVencidos.size());
    }
    
    // Verificar cobros programados para hoy
    @Scheduled(cron = "0 0 8 * * ?") // Todos los días a las 8 AM
    @Transactional
    public void verificarCobrosProgramados() {
        log.info("Verificando cobros programados para hoy...");
        LocalDate hoy = LocalDate.now();
        
        List<com.prestamos.entity.Cuota> cuotasHoy = cuotaRepository.findAll().stream()
            .filter(c -> c.getEstado() == com.prestamos.entity.Cuota.EstadoCuota.PENDIENTE)
            .filter(c -> c.getFechaVencimiento().equals(hoy))
            .collect(java.util.stream.Collectors.toList());
        
        // Agrupar por prestamista
        java.util.Map<Long, List<com.prestamos.entity.Cuota>> cuotasPorPrestamista = cuotasHoy.stream()
            .collect(java.util.stream.Collectors.groupingBy(
                c -> c.getPrestamo().getPrestamista().getId()
            ));
        
        for (java.util.Map.Entry<Long, List<com.prestamos.entity.Cuota>> entry : cuotasPorPrestamista.entrySet()) {
            Long prestamistaId = entry.getKey();
            int cantidadCobros = entry.getValue().size();
            
            if (cantidadCobros > 0) {
                String mensaje = cantidadCobros == 1 
                    ? "Tienes 1 cobro programado para hoy"
                    : String.format("Tienes %d cobros programados para hoy", cantidadCobros);
                
                crearNotificacion(prestamistaId, "info", "Recordatorio de Cobro", 
                    mensaje, "/calendario", null);
            }
        }
        
        log.info("Verificación de cobros programados completada. Encontrados: {}", cuotasHoy.size());
    }
}

