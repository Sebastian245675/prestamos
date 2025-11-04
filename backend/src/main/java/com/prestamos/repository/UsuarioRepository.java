package com.prestamos.repository;

import com.prestamos.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);
    List<Usuario> findByPrestamistaId(Long prestamistaId);
    List<Usuario> findByRolAndPrestamistaId(Usuario.RolUsuario rol, Long prestamistaId);
    Optional<Usuario> findByCodigoReferido(String codigoReferido);
}

