package com.prestamos.service;

import com.prestamos.config.InputSanitizer;
import com.prestamos.config.JwtUtil;
import com.prestamos.dto.AuthResponse;
import com.prestamos.dto.LoginRequest;
import com.prestamos.dto.RegisterRequest;
import com.prestamos.entity.RegistroPendiente;
import com.prestamos.entity.Usuario;
import com.prestamos.repository.RegistroPendienteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    
    private final UsuarioService usuarioService;
    private final ReferidoService referidoService;
    private final PayPalService payPalService;
    private final RegistroPendienteRepository registroPendienteRepository;
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
    public Map<String, Object> iniciarRegistro(RegisterRequest request) {
        try {
            // Sanitizar y validar email
            String email = inputSanitizer.sanitizeEmail(request.getEmail());
            
            // Validar que el email no esté registrado
            if (usuarioService.findByEmail(email).isPresent()) {
                log.warn("Intento de registro con email ya existente: {}", email);
                throw new RuntimeException("El email ya está registrado");
            }
            
            // Validar que no haya un registro pendiente con el mismo email
            Optional<RegistroPendiente> registroExistente = registroPendienteRepository.findByEmail(email);
            if (registroExistente.isPresent() && "PENDIENTE".equals(registroExistente.get().getEstado())) {
                throw new RuntimeException("Ya existe un registro pendiente para este email. Verifica tu correo o espera a que expire.");
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
            
            // Crear orden de pago en PayPal
            Map<String, Object> ordenPago = payPalService.createOrder(tipoSuscripcion, email, nombreCompleto);
            String paypalOrderId = (String) ordenPago.get("orderId");
            String approvalUrl = (String) ordenPago.get("approvalUrl");
            
            // Guardar registro pendiente
            RegistroPendiente registroPendiente = new RegistroPendiente();
            registroPendiente.setEmail(email);
            registroPendiente.setNombreCompleto(nombreCompleto);
            registroPendiente.setTelefono(telefono);
            registroPendiente.setPassword(passwordEncoder.encode(request.getPassword()));
            registroPendiente.setTipoSuscripcion(tipoSuscripcion);
            registroPendiente.setPaypalOrderId(paypalOrderId);
            registroPendiente.setEstado("PENDIENTE");
            
            if (request.getCodigoReferido() != null && !request.getCodigoReferido().trim().isEmpty()) {
                registroPendiente.setCodigoReferido(inputSanitizer.sanitize(request.getCodigoReferido().trim()));
            }
            
            registroPendienteRepository.save(registroPendiente);
            
            log.info("Registro pendiente creado para usuario: {} con orden PayPal: {}", email, paypalOrderId);
            
            // Retornar información de la orden de pago
            Map<String, Object> response = new HashMap<>();
            response.put("paypalOrderId", paypalOrderId);
            response.put("approvalUrl", approvalUrl);
            response.put("precio", ordenPago.get("precio"));
            response.put("tipoSuscripcion", tipoSuscripcion);
            response.put("message", "Por favor completa el pago para finalizar tu registro");
            
            return response;
            
        } catch (IllegalArgumentException e) {
            log.error("Error de validación en registro: {}", e.getMessage());
            throw new RuntimeException(e.getMessage());
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error inesperado en registro: {}", e.getMessage(), e);
            throw new RuntimeException("Error al iniciar registro. Intenta nuevamente");
        }
    }
    
    @Transactional
    public AuthResponse completarRegistro(String paypalOrderId) {
        try {
            // Buscar registro pendiente
            RegistroPendiente registroPendiente = registroPendienteRepository.findByPaypalOrderId(paypalOrderId)
                .orElseThrow(() -> new RuntimeException("Registro pendiente no encontrado"));
            
            if (!"PENDIENTE".equals(registroPendiente.getEstado())) {
                throw new RuntimeException("Este registro ya fue procesado o cancelado");
            }
            
            // Capturar el pago en PayPal
            Map<String, Object> captura = payPalService.captureOrder(paypalOrderId);
            String captureId = (String) captura.get("captureId");
            
            // Actualizar registro pendiente
            registroPendiente.setPaypalCaptureId(captureId);
            registroPendiente.setEstado("PAGADO");
            registroPendiente.setFechaPago(java.time.LocalDateTime.now());
            registroPendienteRepository.save(registroPendiente);
            
            // Crear el usuario final
            RegisterRequest registerRequest = new RegisterRequest();
            registerRequest.setEmail(registroPendiente.getEmail());
            registerRequest.setNombreCompleto(registroPendiente.getNombreCompleto());
            registerRequest.setTelefono(registroPendiente.getTelefono());
            registerRequest.setTipoSuscripcion(registroPendiente.getTipoSuscripcion());
            registerRequest.setCodigoReferido(registroPendiente.getCodigoReferido());
            
            // El password ya está encriptado en registroPendiente, necesitamos guardarlo directamente
            Usuario usuario = new Usuario();
            usuario.setEmail(registroPendiente.getEmail());
            usuario.setPassword(registroPendiente.getPassword()); // Ya está encriptado
            usuario.setNombreCompleto(registroPendiente.getNombreCompleto());
            usuario.setTelefono(registroPendiente.getTelefono());
            usuario.setRol(Usuario.RolUsuario.PRESTAMISTA);
            usuario.setActivo(true);
            
            java.time.LocalDate fechaInicio = java.time.LocalDate.now();
            java.time.LocalDate fechaVencimiento;
            
            if ("ANUAL".equals(registroPendiente.getTipoSuscripcion())) {
                fechaVencimiento = fechaInicio.plusYears(1);
            } else {
                fechaVencimiento = fechaInicio.plusMonths(1);
            }
            
            usuario.setFechaSuscripcion(fechaInicio);
            usuario.setFechaVencimientoSuscripcion(fechaVencimiento);
            usuario.setSuscripcionActiva(true);
            
            usuario = usuarioService.save(usuario);
            
            // Generar código de referido
            String codigoReferido = referidoService.obtenerCodigoReferido(usuario.getId());
            usuario.setCodigoReferido(codigoReferido);
            usuario = usuarioService.save(usuario);
            
            // Procesar referido si se proporcionó código
            if (registroPendiente.getCodigoReferido() != null && !registroPendiente.getCodigoReferido().trim().isEmpty()) {
                try {
                    referidoService.procesarReferido(usuario.getId(), registroPendiente.getCodigoReferido());
                    log.info("Referido procesado para usuario {} con código {}", usuario.getEmail(), registroPendiente.getCodigoReferido());
                } catch (Exception e) {
                    log.warn("Error al procesar referido para usuario {}: {}", usuario.getEmail(), e.getMessage());
                    // No fallar el registro si hay error con el referido
                }
            }
            
            // Generar token
            String token = jwtUtil.generateToken(usuario.getEmail());
            
            log.info("Registro completado exitosamente para usuario: {} con captura PayPal: {}", usuario.getEmail(), captureId);
            
            return new AuthResponse(token, AuthResponse.UserInfo.fromUsuario(usuario));
            
        } catch (Exception e) {
            log.error("Error al completar registro: {}", e.getMessage(), e);
            throw new RuntimeException("Error al completar el registro: " + e.getMessage());
        }
    }
}

