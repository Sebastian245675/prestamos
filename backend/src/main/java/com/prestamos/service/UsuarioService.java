package com.prestamos.service;

import com.prestamos.dto.RegisterRequest;
import com.prestamos.entity.Ruta;
import com.prestamos.entity.Usuario;
import com.prestamos.repository.RutaRepository;
import com.prestamos.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UsuarioService {
    
    private final UsuarioRepository usuarioRepository;
    @Lazy
    private final PasswordEncoder passwordEncoder;
    private final RutaRepository rutaRepository;
    
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
            monto = new BigDecimal("432000"); // 40,000 * 12 * 0.9 (10% descuento)
        } else {
            fechaVencimiento = fechaInicio.plusMonths(1);
            monto = new BigDecimal("40000"); // 40,000 COP mensual
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
        // Los cobradores tienen suscripción activa por un año
        cobrador.setFechaVencimientoSuscripcion(LocalDate.now().plusYears(1));
        cobrador.setSuscripcionActiva(true);
        
        // Establecer permisos por defecto o los proporcionados
        if (request.getPermisos() != null && !request.getPermisos().isEmpty()) {
            cobrador.setPermisos(request.getPermisos());
        } else {
            // Permisos básicos por defecto
            Map<String, Boolean> permisosPorDefecto = new HashMap<>();
            permisosPorDefecto.put("verPrestamos", true);
            permisosPorDefecto.put("registrarAbonos", true);
            permisosPorDefecto.put("editarPrestamos", false);
            permisosPorDefecto.put("eliminarPrestamos", false);
            permisosPorDefecto.put("verCalendario", true);
            permisosPorDefecto.put("verReportes", false);
            permisosPorDefecto.put("gestionarClientes", false);
            permisosPorDefecto.put("exportarDatos", false);
            cobrador.setPermisos(permisosPorDefecto);
        }
        
        cobrador = usuarioRepository.save(cobrador);
        
        // Asignar rutas si se especifica tipo de acceso por rutas
        if (request.getTipoAccesoPrestamos() != null && 
            "RUTAS".equals(request.getTipoAccesoPrestamos()) && 
            request.getRutasAsignadas() != null && 
            !request.getRutasAsignadas().isEmpty()) {
            
            asignarRutasACobrador(cobrador.getId(), prestamistaId, request.getRutasAsignadas());
        }
        
        return cobrador;
    }
    
    @Transactional(readOnly = true)
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
    
    @Transactional
    public void asignarRutasACobrador(Long cobradorId, Long prestamistaId, List<Long> rutasIds) {
        Usuario cobrador = usuarioRepository.findById(cobradorId)
            .orElseThrow(() -> new RuntimeException("Cobrador no encontrado"));
        
        // Limpiar rutas asignadas actuales
        cobrador.setRutasAsignadas(new ArrayList<>());
        cobrador = usuarioRepository.save(cobrador);
        
        // Si la lista está vacía, solo limpiar y retornar
        if (rutasIds == null || rutasIds.isEmpty()) {
            return;
        }
        
        // Validar y asignar nuevas rutas
        List<Ruta> rutasAsignadas = new ArrayList<>();
        for (Long rutaId : rutasIds) {
            Ruta ruta = rutaRepository.findById(rutaId)
                .orElseThrow(() -> new RuntimeException("Ruta no encontrada: " + rutaId));
            
            // Verificar que la ruta pertenezca al prestamista
            if (!ruta.getPrestamista().getId().equals(prestamistaId)) {
                throw new RuntimeException("La ruta no pertenece al prestamista");
            }
            
            rutasAsignadas.add(ruta);
        }
        
        cobrador.setRutasAsignadas(rutasAsignadas);
        usuarioRepository.save(cobrador);
    }
    
    @Transactional(readOnly = true)
    public List<Ruta> obtenerRutasAsignadas(Long cobradorId) {
        Usuario cobrador = usuarioRepository.findById(cobradorId)
            .orElseThrow(() -> new RuntimeException("Cobrador no encontrado"));
        // Forzar la carga de la colección dentro de la transacción
        cobrador.getRutasAsignadas().size(); // Esto fuerza la carga lazy
        return cobrador.getRutasAsignadas();
    }
    
    /**
     * Genera un código único de referido para un usuario
     * Formato: REF-XXXXXX-YYYYYY donde:
     * - XXXXXX es el ID del usuario formateado a 6 dígitos (permite hasta 999,999 usuarios)
     * - YYYYYY es un código aleatorio de 8 caracteres alfanuméricos (16^8 = 4.3 billones de combinaciones)
     * 
     * Este método garantiza unicidad mediante reintentos si hay colisiones
     */
    @Transactional
    private String generarCodigoReferido(Long usuarioId) {
        int maxIntentos = 10;
        int intento = 0;
        
        while (intento < maxIntentos) {
            // Generar código único: REF-XXXXXX-YYYYYY
            // Usar ID del usuario (único) + código aleatorio más largo para evitar colisiones
            String codigoAleatorio = generarCodigoAleatorioSeguro();
            String codigo = "REF-" + String.format("%06d", usuarioId) + "-" + codigoAleatorio;
            
            // Verificar unicidad en la base de datos
            Optional<Usuario> usuarioExistente = usuarioRepository.findByCodigoReferido(codigo);
            if (usuarioExistente.isEmpty()) {
                // Código único encontrado
                return codigo;
            }
            
            intento++;
            log.warn("Colisión detectada en código de referido {}, intento {}", codigo, intento);
        }
        
        // Si después de 10 intentos sigue habiendo colisión (extremadamente improbable),
        // usar un UUID completo como fallback
        String codigoFallback = "REF-" + String.format("%06d", usuarioId) + "-" + 
                                java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        log.warn("Usando código de fallback para usuario {}: {}", usuarioId, codigoFallback);
        return codigoFallback;
    }
    
    /**
     * Genera un código aleatorio seguro de 8 caracteres alfanuméricos
     * Usa caracteres alfanuméricos (A-Z, 0-9) excluyendo caracteres confusos como 0, O, I, 1, L
     */
    private String generarCodigoAleatorioSeguro() {
        // Caracteres seguros: A-Z sin O, I, L + 2-9 (sin 0, 1)
        String caracteresSeguros = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
        java.security.SecureRandom random = new java.security.SecureRandom();
        StringBuilder codigo = new StringBuilder(8);
        
        for (int i = 0; i < 8; i++) {
            int indice = random.nextInt(caracteresSeguros.length());
            codigo.append(caracteresSeguros.charAt(indice));
        }
        
        return codigo.toString();
    }
}

