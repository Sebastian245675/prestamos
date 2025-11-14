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
    
    // Buscar por código de referido con relaciones cargadas
    @Query("SELECT DISTINCT r FROM Referido r LEFT JOIN FETCH r.referidor LEFT JOIN FETCH r.referido WHERE r.codigoReferido = :codigo")
    Optional<Referido> findByCodigoReferido(@Param("codigo") String codigoReferido);
    
    // Obtener todos los referidos de un usuario con relaciones cargadas
    @Query("SELECT DISTINCT r FROM Referido r LEFT JOIN FETCH r.referidor LEFT JOIN FETCH r.referido WHERE r.referidor.id = :referidorId ORDER BY r.fechaRegistro DESC")
    List<Referido> findByReferidorIdOrderByFechaRegistroDesc(@Param("referidorId") Long referidorId);
    
    // Verificar si un usuario ya tiene un referido con relaciones cargadas
    @Query("SELECT DISTINCT r FROM Referido r LEFT JOIN FETCH r.referidor LEFT JOIN FETCH r.referido WHERE r.referido.id = :referidoId")
    Optional<Referido> findByReferidoId(@Param("referidoId") Long referidoId);
    
    // Contar referidos activos de un usuario
    @Query("SELECT COUNT(r) FROM Referido r WHERE r.referidor.id = :referidorId AND r.activo = true")
    long countReferidosActivos(@Param("referidorId") Long referidorId);
    
    // Obtener referidos activos de un usuario con relaciones cargadas
    @Query("SELECT DISTINCT r FROM Referido r LEFT JOIN FETCH r.referidor LEFT JOIN FETCH r.referido WHERE r.referidor.id = :referidorId AND r.activo = true")
    List<Referido> findByReferidorIdAndActivoTrue(@Param("referidorId") Long referidorId);
}

