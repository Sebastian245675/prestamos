package com.prestamos.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MovimientoRequest {
    @NotBlank(message = "El tipo de movimiento es requerido")
    private String tipo; // ENTRADA o SALIDA
    
    @NotNull(message = "El monto es requerido")
    @Min(value = 1, message = "El monto debe ser mayor a 0")
    private BigDecimal monto;
    
    @NotBlank(message = "La descripción es requerida")
    private String descripcion;
    
    @NotNull(message = "La fecha es requerida")
    private LocalDate fecha;
    
    private String observaciones;
}

