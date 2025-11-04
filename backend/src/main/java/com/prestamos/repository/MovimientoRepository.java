package com.prestamos.repository;

import com.prestamos.entity.Movimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface MovimientoRepository extends JpaRepository<Movimiento, Long> {
    List<Movimiento> findByUsuarioId(Long usuarioId);
    
    List<Movimiento> findByUsuarioIdAndTipo(Long usuarioId, Movimiento.TipoMovimiento tipo);
    
    @Query("SELECT m FROM Movimiento m WHERE m.usuario.id = :usuarioId AND m.fecha BETWEEN :fechaInicio AND :fechaFin ORDER BY m.fecha DESC")
    List<Movimiento> findByUsuarioIdAndFechaBetween(
        @Param("usuarioId") Long usuarioId,
        @Param("fechaInicio") LocalDate fechaInicio,
        @Param("fechaFin") LocalDate fechaFin
    );
    
    @Query("SELECT SUM(m.monto) FROM Movimiento m WHERE m.usuario.id = :usuarioId AND m.tipo = :tipo")
    java.math.BigDecimal sumMontoByUsuarioIdAndTipo(
        @Param("usuarioId") Long usuarioId,
        @Param("tipo") Movimiento.TipoMovimiento tipo
    );
}

