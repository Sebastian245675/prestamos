package com.prestamos.service;

import com.prestamos.dto.RegisterRequest;
import com.prestamos.entity.Usuario;
import com.prestamos.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UsuarioService {
    
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    
    public Optional<Usuario> findByEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }
    
    @Transactional
    public Usuario crearPrestamista(RegisterRequest request) {
        Usuario usuario = new Usuario();
        usuario.setEmail(request.getEmail());
        usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        usuario.setNombreCompleto(request.getNombreCompleto());
        usuario.setTelefono(request.getTelefono());
        usuario.setRol(Usuario.RolUsuario.PRESTAMISTA);
        usuario.setActivo(true);
        
        LocalDate fechaInicio = LocalDate.now();
        LocalDate fechaVencimiento;
        BigDecimal monto;
        
        if ("ANUAL".equals(request.getTipoSuscripcion())) {
            fechaVencimiento = fechaInicio.plusYears(1);
            monto = new BigDecimal("270000");
        } else {
            fechaVencimiento = fechaInicio.plusMonths(1);
            monto = new BigDecimal("30000");
        }
        
        usuario.setFechaSuscripcion(fechaInicio);
        usuario.setFechaVencimientoSuscripcion(fechaVencimiento);
        usuario.setSuscripcionActiva(true);
        
        // Guardar primero para obtener el ID
        usuario = usuarioRepository.save(usuario);
        
        // Generar código de referido único con el ID real
        String codigoReferido = generarCodigoReferido(usuario.getId());
        usuario.setCodigoReferido(codigoReferido);
        usuario = usuarioRepository.save(usuario);
        
        return usuario;
    }
    
    @Transactional
    public Usuario crearCobrador(Long prestamistaId, RegisterRequest request) {
        Usuario prestamista = usuarioRepository.findById(prestamistaId)
            .orElseThrow(() -> new RuntimeException("Prestamista no encontrado"));
        
        // Verificar límite de cobradores
        long cantidadCobradores = usuarioRepository.findByRolAndPrestamistaId(
            Usuario.RolUsuario.COBRADOR, prestamistaId).size();
        
        if (cantidadCobradores >= 2) {
            throw new RuntimeException("Ya has alcanzado el límite de 2 cobradores");
        }
        
        Usuario cobrador = new Usuario();
        cobrador.setEmail(request.getEmail());
        cobrador.setPassword(passwordEncoder.encode(request.getPassword()));
        cobrador.setNombreCompleto(request.getNombreCompleto());
        cobrador.setTelefono(request.getTelefono());
        cobrador.setRol(Usuario.RolUsuario.COBRADOR);
        cobrador.setActivo(true);
        cobrador.setPrestamista(prestamista);
        cobrador.setFechaSuscripcion(LocalDate.now());
        cobrador.setFechaVencimientoSuscripcion(LocalDate.now());
        cobrador.setSuscripcionActiva(true);
        
        return usuarioRepository.save(cobrador);
    }
    
    public java.util.List<Usuario> obtenerCobradores(Long prestamistaId) {
        return usuarioRepository.findByRolAndPrestamistaId(
            Usuario.RolUsuario.COBRADOR, prestamistaId);
    }
    
    public Optional<Usuario> findById(Long id) {
        return usuarioRepository.findById(id);
    }
    
    @Transactional
    public Usuario save(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }
    
    private String generarCodigoReferido(Long usuarioId) {
        // Generar código temporal primero, luego se actualizará con el ID real
        String codigo = "REF-" + String.format("%06d", usuarioId != null ? usuarioId : 0) + "-" + 
                       java.util.UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return codigo;
    }
}

