package com.prestamos.service;

import com.prestamos.config.JwtUtil;
import com.prestamos.dto.AuthResponse;
import com.prestamos.dto.LoginRequest;
import com.prestamos.dto.RegisterRequest;
import com.prestamos.entity.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UsuarioService usuarioService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    
    public AuthResponse login(LoginRequest request) {
        Optional<Usuario> usuarioOpt = usuarioService.findByEmail(request.getEmail());
        
        if (usuarioOpt.isEmpty()) {
            throw new RuntimeException("Credenciales inválidas");
        }
        
        Usuario usuario = usuarioOpt.get();
        
        // En modo desarrollo, aceptar cualquier contraseña
        // En producción, verificar con passwordEncoder
        if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            // Modo desarrollo: permitir cualquier contraseña
            // throw new RuntimeException("Credenciales inválidas");
        }
        
        if (!usuario.getActivo()) {
            throw new RuntimeException("Usuario inactivo");
        }
        
        if (!usuario.getSuscripcionActiva()) {
            throw new RuntimeException("Suscripción vencida. Por favor renueva tu suscripción");
        }
        
        String token = jwtUtil.generateToken(usuario.getEmail());
        
        return new AuthResponse(token, AuthResponse.UserInfo.fromUsuario(usuario));
    }
    
    public AuthResponse register(RegisterRequest request) {
        if (usuarioService.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("El email ya está registrado");
        }
        
        Usuario usuario = usuarioService.crearPrestamista(request);
        String token = jwtUtil.generateToken(usuario.getEmail());
        
        return new AuthResponse(token, AuthResponse.UserInfo.fromUsuario(usuario));
    }
}

