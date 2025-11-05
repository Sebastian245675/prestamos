package com.prestamos.dto;

import com.prestamos.entity.Usuario;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.Map;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private UserInfo user;
    
    @Data
    @AllArgsConstructor
    public static class UserInfo {
        private Long id;
        private String email;
        private String nombreCompleto;
        private String telefono;
        private Usuario.RolUsuario rol;
        private Boolean suscripcionActiva;
        private Map<String, Boolean> permisos;
        
        public static UserInfo fromUsuario(Usuario usuario) {
            return new UserInfo(
                usuario.getId(),
                usuario.getEmail(),
                usuario.getNombreCompleto(),
                usuario.getTelefono(),
                usuario.getRol(),
                usuario.getSuscripcionActiva(),
                usuario.getPermisos()
            );
        }
    }
}

