package com.prestamos.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "cuotas", indexes = {
    @Index(name = "idx_cuotas_prestamo", columnList = "prestamo_id"),
    @Index(name = "idx_cuotas_fecha_vencimiento", columnList = "fecha_vencimiento"),
    @Index(name = "idx_cuotas_estado", columnList = "estado"),
    @Index(name = "idx_cuotas_prestamo_numero", columnList = "prestamo_id, numero_cuota"),
    @Index(name = "idx_cuotas_prestamo_estado", columnList = "prestamo_id, estado"),
    @Index(name = "idx_cuotas_fecha_vencimiento_estado", columnList = "fecha_vencimiento, estado")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cuota {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "prestamo_id", nullable = false)
    private Prestamo prestamo;
    
    @Column(nullable = false)
    private Integer numeroCuota;
    
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal monto;
    
    @Column(nullable = false)
    private LocalDate fechaVencimiento;
    
    @Column
    private LocalDate fechaPago;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoCuota estado;
    
    @Column(nullable = false)
    private LocalDateTime fechaCreacion;
    
    @Column(nullable = false)
    private LocalDateTime fechaActualizacion;
    
    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        fechaActualizacion = LocalDateTime.now();
        if (estado == null) {
            estado = EstadoCuota.PENDIENTE;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }
    
    public enum EstadoCuota {
        PENDIENTE,
        PAGADA,
        VENCIDA
    }
}

