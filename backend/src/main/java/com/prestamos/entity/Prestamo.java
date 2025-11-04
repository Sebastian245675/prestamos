package com.prestamos.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "prestamos", indexes = {
    @Index(name = "idx_prestamos_prestamista", columnList = "prestamista_id"),
    @Index(name = "idx_prestamos_cobrador", columnList = "cobrador_id"),
    @Index(name = "idx_prestamos_estado", columnList = "estado"),
    @Index(name = "idx_prestamos_zona", columnList = "zona"),
    @Index(name = "idx_prestamos_fecha_vencimiento", columnList = "fecha_vencimiento"),
    @Index(name = "idx_prestamos_fecha_creacion", columnList = "fecha_creacion DESC"),
    @Index(name = "idx_prestamos_prestamista_estado", columnList = "prestamista_id, estado"),
    @Index(name = "idx_prestamos_prestamista_fecha_creacion", columnList = "prestamista_id, fecha_creacion DESC"),
    @Index(name = "idx_prestamos_prestamista_estado_fecha", columnList = "prestamista_id, estado, fecha_creacion DESC"),
    @Index(name = "idx_prestamos_zona_estado", columnList = "zona, estado")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Prestamo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "prestamista_id", nullable = false)
    private Usuario prestamista;
    
    @ManyToOne
    @JoinColumn(name = "cobrador_id")
    private Usuario cobrador;
    
    @Column(nullable = false)
    private String nombreCliente;
    
    @Column(nullable = false)
    private String direccion;
    
    @Column(nullable = false)
    private String telefono;
    
    @Column
    private String email;
    
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal montoPrestado;
    
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal saldoPendiente;
    
    @Column(nullable = false)
    private Integer numeroCuotas;
    
    @Column(nullable = false)
    private Integer cuotasPagadas = 0;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FrecuenciaPago frecuenciaPago;
    
    @Column(nullable = false)
    private LocalDate fechaInicio;
    
    @Column(nullable = false)
    private LocalDate fechaVencimiento;
    
    @Column(nullable = false)
    private Boolean recordatoriosActivos = true;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoPrestamo estado;
    
    @Column(nullable = false)
    private String zona;
    
    @OneToMany(mappedBy = "prestamo", cascade = CascadeType.ALL)
    private List<Abono> abonos;
    
    @OneToMany(mappedBy = "prestamo", cascade = CascadeType.ALL)
    private List<Cuota> cuotas;
    
    @Column(nullable = false)
    private LocalDateTime fechaCreacion;
    
    @Column(nullable = false)
    private LocalDateTime fechaActualizacion;
    
    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        fechaActualizacion = LocalDateTime.now();
        if (saldoPendiente == null) {
            saldoPendiente = montoPrestado;
        }
        if (estado == null) {
            estado = EstadoPrestamo.ACTIVO;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }
    
    public enum EstadoPrestamo {
        ACTIVO,
        VENCIDO,
        FINALIZADO,
        INCOBRABLE
    }
    
    public enum FrecuenciaPago {
        DIARIO,
        SEMANAL,
        QUINCENAL,
        MENSUAL
    }
}

