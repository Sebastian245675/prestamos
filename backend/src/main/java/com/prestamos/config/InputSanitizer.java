package com.prestamos.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

@Component
@Slf4j
public class InputSanitizer {
    
    // Patrones para detectar posibles ataques
    private static final Pattern SQL_INJECTION_PATTERN = Pattern.compile(
        "(?i)(union|select|insert|update|delete|drop|create|alter|exec|execute|script|javascript|onerror|onload)"
    );
    
    private static final Pattern XSS_PATTERN = Pattern.compile(
        "(?i)(<script|</script>|<iframe|</iframe>|javascript:|onerror=|onload=)"
    );
    
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    );
    
    private static final Pattern PHONE_PATTERN = Pattern.compile(
        "^[0-9]{7,15}$"
    );
    
    /**
     * Sanitiza una cadena de texto removiendo caracteres peligrosos
     */
    public String sanitize(String input) {
        if (input == null) {
            return null;
        }
        
        // Remover espacios al inicio y final
        String sanitized = input.trim();
        
        // Remover caracteres de control
        sanitized = sanitized.replaceAll("[\\x00-\\x1F\\x7F]", "");
        
        // Escapar caracteres HTML peligrosos
        sanitized = sanitized
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&#x27;")
            .replace("/", "&#x2F;");
        
        return sanitized;
    }
    
    /**
     * Valida y sanitiza un email
     */
    public String sanitizeEmail(String email) {
        if (email == null) {
            throw new IllegalArgumentException("Email no puede ser nulo");
        }
        
        String sanitized = email.trim().toLowerCase();
        
        if (!EMAIL_PATTERN.matcher(sanitized).matches()) {
            throw new IllegalArgumentException("Formato de email inválido");
        }
        
        return sanitized;
    }
    
    /**
     * Valida y sanitiza un teléfono
     */
    public String sanitizePhone(String phone) {
        if (phone == null) {
            throw new IllegalArgumentException("Teléfono no puede ser nulo");
        }
        
        // Remover caracteres no numéricos excepto + al inicio
        String sanitized = phone.replaceAll("[^0-9+]", "");
        
        if (sanitized.startsWith("+")) {
            sanitized = sanitized.substring(1);
        }
        
        if (!PHONE_PATTERN.matcher(sanitized).matches()) {
            throw new IllegalArgumentException("Formato de teléfono inválido");
        }
        
        return sanitized;
    }
    
    /**
     * Valida que no contenga patrones de SQL injection
     */
    public boolean isValidInput(String input) {
        if (input == null) {
            return true;
        }
        
        return !SQL_INJECTION_PATTERN.matcher(input).find() &&
               !XSS_PATTERN.matcher(input).find();
    }
    
    /**
     * Sanitiza un número para prevenir inyección
     */
    public Long sanitizeLong(String input) {
        if (input == null || input.trim().isEmpty()) {
            throw new IllegalArgumentException("Valor numérico requerido");
        }
        
        try {
            return Long.parseLong(input.trim());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Formato numérico inválido");
        }
    }
    
    /**
     * Sanitiza un número decimal
     */
    public java.math.BigDecimal sanitizeBigDecimal(String input) {
        if (input == null || input.trim().isEmpty()) {
            throw new IllegalArgumentException("Valor decimal requerido");
        }
        
        try {
            return new java.math.BigDecimal(input.trim().replace(",", "."));
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Formato decimal inválido");
        }
    }
    
    /**
     * Valida y sanitiza un nombre (solo letras, espacios, y algunos caracteres especiales)
     */
    public String sanitizeName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Nombre requerido");
        }
        
        String sanitized = name.trim();
        
        // Solo permitir letras, espacios, acentos, guiones y apostrofes
        if (!sanitized.matches("^[\\p{L}\\s'-]+$")) {
            throw new IllegalArgumentException("Nombre contiene caracteres inválidos");
        }
        
        if (sanitized.length() > 255) {
            throw new IllegalArgumentException("Nombre demasiado largo (máximo 255 caracteres)");
        }
        
        if (!isValidInput(sanitized)) {
            log.warn("Intento de inyección detectado en nombre: {}", sanitized);
            throw new IllegalArgumentException("Entrada no válida detectada");
        }
        
        return sanitized;
    }
}
