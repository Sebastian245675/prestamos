package com.prestamos.repository;

import com.prestamos.entity.Cuota;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface CuotaRepository extends JpaRepository<Cuota, Long> {
    List<Cuota> findByPrestamoId(Long prestamoId);
    List<Cuota> findByFechaVencimiento(LocalDate fechaVencimiento);
    
    @Query("SELECT c FROM Cuota c WHERE c.fechaVencimiento BETWEEN :fechaInicio AND :fechaFin")
    List<Cuota> findByFechaVencimientoBetween(@Param("fechaInicio") LocalDate fechaInicio, 
                                               @Param("fechaFin") LocalDate fechaFin);
}

