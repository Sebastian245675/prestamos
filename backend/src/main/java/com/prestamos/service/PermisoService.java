package com.prestamos.service;

import com.prestamos.config.SecurityUtils;
import com.prestamos.entity.Usuario;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PermisoService {
    
    private final UsuarioService usuarioService;
    private final SecurityUtils securityUtils;
    
    /**
     * Verifica si el usuario actual tiene un permiso específico
     */
    public boolean tienePermiso(String permiso) {
        Optional<Long> userIdOpt = securityUtils.getCurrentUserId();
        if (userIdOpt.isEmpty()) {
            return false;
        }
        
        Optional<Usuario> usuarioOpt = usuarioService.findById(userIdOpt.get());
        if (usuarioOpt.isEmpty()) {
            return false;
        }
        
        Usuario usuario = usuarioOpt.get();
        
        // Los prestamistas tienen todos los permisos
        if (usuario.getRol() == Usuario.RolUsuario.PRESTAMISTA) {
            return true;
        }
        
        // Para cobradores, verificar permisos específicos
        if (usuario.getRol() == Usuario.RolUsuario.COBRADOR) {
            Map<String, Boolean> permisos = usuario.getPermisos();
            if (permisos == null || permisos.isEmpty()) {
                return false;
            }
            return permisos.getOrDefault(permiso, false);
        }
        
        return false;
    }
    
    /**
     * Verifica permisos y lanza excepción si no tiene el permiso
     */
    public void verificarPermiso(String permiso) {
        if (!tienePermiso(permiso)) {
            throw new RuntimeException("No tienes permiso para realizar esta acción: " + permiso);
        }
    }
    
    /**
     * Obtiene el usuario actual desde el contexto de seguridad
     */
    public Optional<Usuario> getUsuarioActual() {
        return securityUtils.getCurrentUserId()
            .flatMap(usuarioService::findById);
    }
}

