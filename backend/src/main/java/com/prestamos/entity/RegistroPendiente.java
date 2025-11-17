package com.prestamos.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "registros_pendientes", indexes = {
    @Index(name = "idx_registros_pendientes_email", columnList = "email"),
    @Index(name = "idx_registros_pendientes_order_id", columnList = "paypal_order_id", unique = true),
    @Index(name = "idx_registros_pendientes_fecha", columnList = "fecha_creacion")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegistroPendiente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String nombreCompleto;
    
    @Column(nullable = false)
    private String telefono;
    
    @Column(nullable = false)
    private String password; // Hash de la contraseña
    
    @Column(nullable = false)
    private String tipoSuscripcion; // MENSUAL o ANUAL
    
    @Column(nullable = true)
    private String codigoReferido; // Código de referido opcional
    
    @Column(nullable = false, unique = true)
    private String paypalOrderId; // ID de la orden de PayPal
    
    @Column(nullable = true)
    private String paypalCaptureId; // ID de la captura de pago
    
    @Column(nullable = false)
    private String estado; // PENDIENTE, PAGADO, EXPIRADO, CANCELADO
    
    @Column(nullable = false)
    private LocalDateTime fechaCreacion;
    
    @Column(nullable = true)
    private LocalDateTime fechaPago;
    
    @Column(nullable = true)
    private LocalDateTime fechaExpiracion;
    
    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        if (fechaExpiracion == null) {
            // El registro expira en 24 horas
            fechaExpiracion = fechaCreacion.plusHours(24);
        }
        if (estado == null) {
            estado = "PENDIENTE";
        }
    }
}

