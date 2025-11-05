package com.prestamos.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "usuarios", indexes = {
    @Index(name = "idx_usuarios_email", columnList = "email"),
    @Index(name = "idx_usuarios_prestamista", columnList = "prestamista_id"),
    @Index(name = "idx_usuarios_rol", columnList = "rol"),
    @Index(name = "idx_usuarios_activo", columnList = "activo"),
    @Index(name = "idx_usuarios_codigo_referido", columnList = "codigo_referido", unique = true)
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false)
    private String nombreCompleto;
    
    @Column(nullable = false)
    private String telefono;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RolUsuario rol;
    
    @Column(nullable = false)
    private Boolean activo = true;
    
    @Column(nullable = false)
    private LocalDate fechaSuscripcion;
    
    @Column(nullable = false)
    private LocalDate fechaVencimientoSuscripcion;
    
    @Column(nullable = false)
    private Boolean suscripcionActiva = false;
    
    @Column(unique = true, length = 50)
    private String codigoReferido; // Código único de referido del usuario
    
    @ManyToOne
    @JoinColumn(name = "prestamista_id")
    private Usuario prestamista; // Para cobradores
    
    @OneToMany(mappedBy = "prestamista")
    @JsonIgnore
    private List<Prestamo> prestamos;
    
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "cobrador_rutas",
        joinColumns = @JoinColumn(name = "cobrador_id"),
        inverseJoinColumns = @JoinColumn(name = "ruta_id")
    )
    @JsonIgnore
    private List<Ruta> rutasAsignadas = new ArrayList<>();
    
    @Column(nullable = false)
    private LocalDateTime fechaCreacion;
    
    @Column(nullable = false)
    private LocalDateTime fechaActualizacion;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Boolean> permisos = new HashMap<>();
    
    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        fechaActualizacion = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }
    
    public enum RolUsuario {
        PRESTAMISTA,
        COBRADOR,
        CLIENTE
    }
}

