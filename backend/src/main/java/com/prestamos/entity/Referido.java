package com.prestamos.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "referidos", indexes = {
    @Index(name = "idx_referidos_referidor", columnList = "referidor_id"),
    @Index(name = "idx_referidos_referido", columnList = "referido_id"),
    @Index(name = "idx_referidos_codigo", columnList = "codigo_referido", unique = true),
    @Index(name = "idx_referidos_fecha", columnList = "fecha_registro DESC")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Referido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "referidor_id", nullable = false)
    private Usuario referidor; // Quien refirió
    
    @ManyToOne
    @JoinColumn(name = "referido_id", nullable = false, unique = true)
    private Usuario referido; // Quien fue referido
    
    @Column(nullable = false, unique = true, length = 50)
    private String codigoReferido; // Código usado para el registro
    
    @Column(nullable = false)
    private LocalDate fechaRegistro;
    
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal montoGenerado = BigDecimal.ZERO; // Total de préstamos del referido
    
    @Column(nullable = false)
    private Boolean activo = true; // Si el referido tiene préstamos activos
    
    @Column(nullable = false)
    private LocalDateTime fechaCreacion;
    
    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        if (fechaRegistro == null) {
            fechaRegistro = LocalDate.now();
        }
    }
    
    public enum EstadoRecompensa {
        PENDIENTE,
        DISPONIBLE,
        PAGADA
    }
}

