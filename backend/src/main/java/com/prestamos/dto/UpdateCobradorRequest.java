package com.prestamos.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class UpdateCobradorRequest {
    @NotBlank(message = "El nombre completo es requerido")
    private String nombreCompleto;
    
    @NotBlank(message = "El email es requerido")
    @Email(message = "El email debe ser válido")
    private String email;
    
    @NotBlank(message = "El teléfono es requerido")
    private String telefono;
    
    // Password es opcional al actualizar
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    private String password;
    
    private Map<String, Boolean> permisos; // Permisos para cobradores
    
    // Para asignación de rutas cuando tiene permiso verPrestamos
    private String tipoAccesoPrestamos; // "TODOS" o "RUTAS"
    private List<Long> rutasAsignadas; // IDs de rutas asignadas
}

