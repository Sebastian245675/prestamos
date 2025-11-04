package com.prestamos.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "movimientos", indexes = {
    @Index(name = "idx_movimientos_usuario", columnList = "usuario_id"),
    @Index(name = "idx_movimientos_fecha", columnList = "fecha DESC"),
    @Index(name = "idx_movimientos_tipo", columnList = "tipo"),
    @Index(name = "idx_movimientos_fecha_creacion", columnList = "fecha_creacion DESC"),
    @Index(name = "idx_movimientos_usuario_fecha", columnList = "usuario_id, fecha DESC"),
    @Index(name = "idx_movimientos_usuario_tipo_fecha", columnList = "usuario_id, tipo, fecha DESC")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Movimiento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoMovimiento tipo;
    
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal monto;
    
    @Column(nullable = false)
    private String descripcion;
    
    @Column(nullable = false)
    private LocalDate fecha;
    
    @Column(columnDefinition = "TEXT")
    private String observaciones;
    
    @Column(nullable = false)
    private LocalDateTime fechaCreacion;
    
    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
    }
    
    public enum TipoMovimiento {
        ENTRADA,    // Ingresos
        SALIDA      // Gastos/Egresos
    }
}

