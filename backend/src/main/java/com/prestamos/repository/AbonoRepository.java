package com.prestamos.repository;

import com.prestamos.entity.Abono;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface AbonoRepository extends JpaRepository<Abono, Long> {
    List<Abono> findByPrestamoId(Long prestamoId);
    
    @Query("SELECT SUM(a.monto) FROM Abono a WHERE a.prestamo.id = :prestamoId")
    java.math.BigDecimal sumMontoByPrestamoId(@Param("prestamoId") Long prestamoId);
    
    @Query("SELECT a FROM Abono a WHERE a.fechaAbono BETWEEN :fechaInicio AND :fechaFin")
    List<Abono> findByFechaAbonoBetween(@Param("fechaInicio") LocalDate fechaInicio, 
                                        @Param("fechaFin") LocalDate fechaFin);
}

