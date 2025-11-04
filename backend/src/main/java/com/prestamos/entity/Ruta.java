package com.prestamos.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "rutas", indexes = {
    @Index(name = "idx_rutas_prestamista", columnList = "prestamista_id"),
    @Index(name = "idx_rutas_nombre", columnList = "prestamista_id, nombre")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ruta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "prestamista_id", nullable = false)
    private Usuario prestamista;
    
    @Column(nullable = false)
    private String nombre;
    
    @Column(nullable = false, length = 7)
    private String color; // Color en formato hexadecimal (#RRGGBB)
    
    @Column(nullable = false)
    private Boolean activa = true;
    
    @Column(nullable = false)
    private LocalDateTime fechaCreacion;
    
    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
    }
}

