package com.prestamos.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "usuarios")
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
    
    @ManyToOne
    @JoinColumn(name = "prestamista_id")
    private Usuario prestamista; // Para cobradores
    
    @OneToMany(mappedBy = "usuario")
    private List<Prestamo> prestamos;
    
    @Column(nullable = false)
    private LocalDateTime fechaCreacion;
    
    @Column(nullable = false)
    private LocalDateTime fechaActualizacion;
    
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

