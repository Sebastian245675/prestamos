package com.prestamos.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "abonos", indexes = {
    @Index(name = "idx_abonos_prestamo", columnList = "prestamo_id"),
    @Index(name = "idx_abonos_fecha", columnList = "fecha_abono DESC"),
    @Index(name = "idx_abonos_usuario", columnList = "usuario_id"),
    @Index(name = "idx_abonos_prestamo_fecha", columnList = "prestamo_id, fecha_abono DESC")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Abono {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "prestamo_id", nullable = false)
    private Prestamo prestamo;
    
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario; // Quien registra el abono
    
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal monto;
    
    @Column(nullable = false)
    private LocalDate fechaAbono;
    
    @Column(columnDefinition = "TEXT")
    private String observaciones;
    
    @Column(nullable = false)
    private Boolean esSoloIntereses = false;
    
    @Column(nullable = false)
    private LocalDateTime fechaCreacion;
    
    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
    }
}

