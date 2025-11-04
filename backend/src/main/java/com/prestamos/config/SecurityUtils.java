package com.prestamos.config;

import com.prestamos.entity.Usuario;
import com.prestamos.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class SecurityUtils {
    
    private final UsuarioRepository usuarioRepository;
    
    /**
     * Obtiene el email del usuario autenticado desde el contexto de seguridad
     */
    public Optional<String> getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.isAuthenticated() && 
            !authentication.getPrincipal().equals("anonymousUser")) {
            return Optional.of(authentication.getName());
        }
        
        return Optional.empty();
    }
    
    /**
     * Obtiene el usuario completo autenticado
     */
    public Optional<Usuario> getCurrentUser() {
        return getCurrentUserEmail()
            .flatMap(usuarioRepository::findByEmail);
    }
    
    /**
     * Obtiene el ID del usuario autenticado
     */
    public Optional<Long> getCurrentUserId() {
        return getCurrentUser()
            .map(Usuario::getId);
    }
    
    /**
     * Verifica si el usuario autenticado es el propietario del recurso
     */
    public boolean isOwner(Long resourceOwnerId) {
        return getCurrentUserId()
            .map(userId -> userId.equals(resourceOwnerId))
            .orElse(false);
    }
    
    /**
     * Verifica si el usuario actual tiene un rol específico
     */
    public boolean hasRole(Usuario.RolUsuario role) {
        return getCurrentUser()
            .map(usuario -> usuario.getRol() == role)
            .orElse(false);
    }
}
