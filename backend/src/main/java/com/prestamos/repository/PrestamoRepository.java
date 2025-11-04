package com.prestamos.repository;

import com.prestamos.entity.Prestamo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface PrestamoRepository extends JpaRepository<Prestamo, Long> {
    List<Prestamo> findByPrestamistaId(Long prestamistaId);
    List<Prestamo> findByCobradorId(Long cobradorId);
    List<Prestamo> findByZona(String zona);
    List<Prestamo> findByEstado(Prestamo.EstadoPrestamo estado);
    
    @Query("SELECT p FROM Prestamo p WHERE p.fechaVencimiento BETWEEN :fechaInicio AND :fechaFin")
    List<Prestamo> findByFechaVencimientoBetween(@Param("fechaInicio") LocalDate fechaInicio, 
                                                  @Param("fechaFin") LocalDate fechaFin);
}

