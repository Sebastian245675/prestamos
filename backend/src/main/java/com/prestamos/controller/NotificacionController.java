package com.prestamos.controller;

import com.prestamos.config.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/notificaciones")
@RequiredArgsConstructor
@Slf4j
public class NotificacionController {
    
    private final SecurityUtils securityUtils;
    
    @GetMapping
    public ResponseEntity<?> obtenerNotificaciones() {
        try {
            // Verificar autenticación (aunque no usamos userId por ahora)
            securityUtils.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));
            
            // Por ahora, devolver notificaciones mock
            // TODO: Implementar sistema real de notificaciones con base de datos
            List<Map<String, Object>> notificaciones = new ArrayList<>();
            
            // Ejemplo de notificaciones mock
            notificaciones.add(createNotification(
                1L, "warning", "Préstamo Vencido", 
                "El préstamo de Juan Pérez está vencido", false, "/prestamos/1"
            ));
            
            notificaciones.add(createNotification(
                2L, "info", "Recordatorio de Cobro", 
                "Tienes 3 cobros programados para hoy", false, "/calendario"
            ));
            
            notificaciones.add(createNotification(
                3L, "success", "Abono Registrado", 
                "Se registró un abono de $100.000", true, "/prestamos"
            ));
            
            notificaciones.add(createNotification(
                4L, "warning", "Suscripción Próxima a Vencer", 
                "Tu suscripción vence en 5 días", false, "/dashboard"
            ));
            
            return ResponseEntity.ok(notificaciones);
            
        } catch (Exception e) {
            log.error("Error al obtener notificaciones: {}", e.getMessage());
            // Si hay error, devolver lista vacía
            return ResponseEntity.ok(Collections.emptyList());
        }
    }
    
    private Map<String, Object> createNotification(Long id, String type, String title, 
                                                   String message, boolean read, String link) {
        Map<String, Object> notification = new HashMap<>();
        notification.put("id", id);
        notification.put("type", type);
        notification.put("title", title);
        notification.put("message", message);
        notification.put("read", read);
        notification.put("link", link);
        notification.put("fecha", Instant.now().toString());
        return notification;
    }
}

