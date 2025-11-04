package com.prestamos.repository;

import com.prestamos.entity.Ruta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RutaRepository extends JpaRepository<Ruta, Long> {
    List<Ruta> findByPrestamistaIdOrderByNombreAsc(Long prestamistaId);
    List<Ruta> findByPrestamistaIdAndActivaTrueOrderByNombreAsc(Long prestamistaId);
}

