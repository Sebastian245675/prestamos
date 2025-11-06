package com.prestamos.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notificaciones", indexes = {
    @Index(name = "idx_notificaciones_usuario", columnList = "usuario_id"),
    @Index(name = "idx_notificaciones_leida", columnList = "leida"),
    @Index(name = "idx_notificaciones_fecha", columnList = "fecha_creacion DESC"),
    @Index(name = "idx_notificaciones_usuario_leida", columnList = "usuario_id, leida"),
    @Index(name = "idx_notificaciones_usuario_fecha", columnList = "usuario_id, fecha_creacion DESC")
})
public class Notificacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
    
    @Column(nullable = false)
    private String tipo; // warning, error, success, info
    
    @Column(nullable = false)
    private String titulo;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String mensaje;
    
    @Column(nullable = false)
    private Boolean leida = false;
    
    @Column
    private String link; // URL para redirigir cuando se hace clic
    
    @Column
    private Long prestamoId; // ID del préstamo relacionado (opcional)
    
    @Column(nullable = false)
    private LocalDateTime fechaCreacion;
    
    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        if (leida == null) {
            leida = false;
        }
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    
    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }
    
    public Boolean getLeida() { return leida; }
    public void setLeida(Boolean leida) { this.leida = leida; }
    
    public String getLink() { return link; }
    public void setLink(String link) { this.link = link; }
    
    public Long getPrestamoId() { return prestamoId; }
    public void setPrestamoId(Long prestamoId) { this.prestamoId = prestamoId; }
    
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    
    // Constructors
    public Notificacion() {}
    
    public Notificacion(Long id, Usuario usuario, String tipo, String titulo, String mensaje, Boolean leida, String link, Long prestamoId, LocalDateTime fechaCreacion) {
        this.id = id;
        this.usuario = usuario;
        this.tipo = tipo;
        this.titulo = titulo;
        this.mensaje = mensaje;
        this.leida = leida;
        this.link = link;
        this.prestamoId = prestamoId;
        this.fechaCreacion = fechaCreacion;
    }
}

