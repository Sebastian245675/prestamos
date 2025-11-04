package com.prestamos.service;

import com.prestamos.config.InputSanitizer;
import com.prestamos.config.JwtUtil;
import com.prestamos.dto.AuthResponse;
import com.prestamos.dto.LoginRequest;
import com.prestamos.dto.RegisterRequest;
import com.prestamos.entity.Usuario;
import com.prestamos.service.ReferidoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    
    private final UsuarioService usuarioService;
    private final ReferidoService referidoService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final InputSanitizer inputSanitizer;
    
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        try {
            // Sanitizar email
            String email = inputSanitizer.sanitizeEmail(request.getEmail());
            
            // Validar contraseña no vacía
            if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
                throw new RuntimeException("La contraseña es requerida");
            }
            
            // Buscar usuario
            Optional<Usuario> usuarioOpt = usuarioService.findByEmail(email);
            
            if (usuarioOpt.isEmpty()) {
                log.warn("Intento de login con email no registrado: {}", email);
                // No revelar si el email existe o no (seguridad)
                throw new RuntimeException("Credenciales inválidas");
            }
            
            Usuario usuario = usuarioOpt.get();
            
            // Verificar contraseña
            if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
                log.warn("Intento de login con contraseña incorrecta para: {}", email);
                throw new RuntimeException("Credenciales inválidas");
            }
            
            // Validar usuario activo
            if (!usuario.getActivo()) {
                log.warn("Intento de login de usuario inactivo: {}", email);
                throw new RuntimeException("Usuario inactivo. Contacta al administrador");
            }
            
            // Validar suscripción activa
            if (!usuario.getSuscripcionActiva()) {
                log.warn("Intento de login de usuario con suscripción vencida: {}", email);
                throw new RuntimeException("Suscripción vencida. Por favor renueva tu suscripción");
            }
            
            // Generar token
            String token = jwtUtil.generateToken(usuario.getEmail());
            
            log.info("Login exitoso para usuario: {}", email);
            
            return new AuthResponse(token, AuthResponse.UserInfo.fromUsuario(usuario));
            
        } catch (IllegalArgumentException e) {
            log.error("Error de validación en login: {}", e.getMessage());
            throw new RuntimeException(e.getMessage());
        } catch (Exception e) {
            log.error("Error inesperado en login: {}", e.getMessage());
            throw new RuntimeException("Error al iniciar sesión. Intenta nuevamente");
        }
    }
    
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        try {
            // Sanitizar y validar email
            String email = inputSanitizer.sanitizeEmail(request.getEmail());
            
            // Validar que el email no esté registrado
            if (usuarioService.findByEmail(email).isPresent()) {
                log.warn("Intento de registro con email ya existente: {}", email);
                throw new RuntimeException("El email ya está registrado");
            }
            
            // Sanitizar nombre
            String nombreCompleto = inputSanitizer.sanitizeName(request.getNombreCompleto());
            
            // Sanitizar teléfono
            String telefono = inputSanitizer.sanitizePhone(request.getTelefono());
            
            // Validar contraseña
            if (request.getPassword() == null || request.getPassword().length() < 6) {
                throw new RuntimeException("La contraseña debe tener al menos 6 caracteres");
            }
            
            // Validar tipo de suscripción
            String tipoSuscripcion = request.getTipoSuscripcion();
            if (tipoSuscripcion == null || 
                (!tipoSuscripcion.equals("MENSUAL") && !tipoSuscripcion.equals("ANUAL"))) {
                throw new RuntimeException("Tipo de suscripción inválido");
            }
            
            // Crear usuario
            RegisterRequest sanitizedRequest = new RegisterRequest();
            sanitizedRequest.setEmail(email);
            sanitizedRequest.setNombreCompleto(nombreCompleto);
            sanitizedRequest.setTelefono(telefono);
            sanitizedRequest.setPassword(request.getPassword()); // Se encriptará en el servicio
            sanitizedRequest.setTipoSuscripcion(tipoSuscripcion);
            
            Usuario usuario = usuarioService.crearPrestamista(sanitizedRequest);
            
            // Procesar referido si se proporcionó código
            if (request.getCodigoReferido() != null && !request.getCodigoReferido().trim().isEmpty()) {
                try {
                    String codigoReferido = inputSanitizer.sanitize(request.getCodigoReferido().trim());
                    referidoService.procesarReferido(usuario.getId(), codigoReferido);
                    log.info("Referido procesado para usuario {} con código {}", email, codigoReferido);
                } catch (Exception e) {
                    log.warn("Error al procesar referido para usuario {}: {}", email, e.getMessage());
                    // No fallar el registro si hay error con el referido
                }
            }
            
            // Generar token
            String token = jwtUtil.generateToken(usuario.getEmail());
            
            log.info("Registro exitoso para usuario: {}", email);
            
            return new AuthResponse(token, AuthResponse.UserInfo.fromUsuario(usuario));
            
        } catch (IllegalArgumentException e) {
            log.error("Error de validación en registro: {}", e.getMessage());
            throw new RuntimeException(e.getMessage());
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error inesperado en registro: {}", e.getMessage());
            throw new RuntimeException("Error al registrarse. Intenta nuevamente");
        }
    }
}

