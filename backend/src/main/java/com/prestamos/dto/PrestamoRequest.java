package com.prestamos.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PrestamoRequest {
    @NotBlank(message = "El nombre del cliente es requerido")
    private String nombreCliente;
    
    @NotBlank(message = "La dirección es requerida")
    private String direccion;
    
    @NotBlank(message = "El teléfono es requerido")
    private String telefono;
    
    private String email;
    
    @NotNull(message = "El monto prestado es requerido")
    @Min(value = 1, message = "El monto debe ser mayor a 0")
    private BigDecimal montoPrestado;
    
    @NotNull(message = "El número de cuotas es requerido")
    @Min(value = 1, message = "Debe tener al menos 1 cuota")
    private Integer numeroCuotas;
    
    @NotBlank(message = "La frecuencia de pago es requerida")
    private String frecuenciaPago;
    
    @NotNull(message = "La fecha de inicio es requerida")
    private LocalDate fechaInicio;
    
    @NotBlank(message = "La zona es requerida")
    private String zona;
    
    private Boolean recordatoriosActivos = true;
    
    private Long cobradorId;
}

