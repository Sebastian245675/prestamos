package com.prestamos.repository;

import com.prestamos.entity.Referido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReferidoRepository extends JpaRepository<Referido, Long> {
    
    // Buscar por código de referido
    Optional<Referido> findByCodigoReferido(String codigoReferido);
    
    // Obtener todos los referidos de un usuario
    List<Referido> findByReferidorIdOrderByFechaRegistroDesc(Long referidorId);
    
    // Verificar si un usuario ya tiene un referido
    Optional<Referido> findByReferidoId(Long referidoId);
    
    // Contar referidos activos de un usuario
    @Query("SELECT COUNT(r) FROM Referido r WHERE r.referidor.id = :referidorId AND r.activo = true")
    long countReferidosActivos(@Param("referidorId") Long referidorId);
    
    // Obtener referidos activos de un usuario
    List<Referido> findByReferidorIdAndActivoTrue(Long referidorId);
}

