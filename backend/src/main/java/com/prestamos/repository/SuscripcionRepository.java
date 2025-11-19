package com.prestamos.repository;

import com.prestamos.entity.Suscripcion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SuscripcionRepository extends JpaRepository<Suscripcion, Long> {
    
    List<Suscripcion> findByUsuarioIdOrderByFechaCreacionDesc(Long usuarioId);
    
    Optional<Suscripcion> findFirstByUsuarioIdAndEstadoOrderByFechaCreacionDesc(Long usuarioId, Suscripcion.EstadoSuscripcion estado);
    
    Optional<Suscripcion> findFirstByUsuarioIdOrderByFechaCreacionDesc(Long usuarioId);
}

