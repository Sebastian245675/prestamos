package com.prestamos.repository;

import com.prestamos.entity.RegistroPendiente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RegistroPendienteRepository extends JpaRepository<RegistroPendiente, Long> {
    Optional<RegistroPendiente> findByEmail(String email);
    Optional<RegistroPendiente> findByPaypalOrderId(String paypalOrderId);
}

