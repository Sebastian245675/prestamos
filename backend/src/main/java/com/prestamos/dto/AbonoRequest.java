package com.prestamos.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class AbonoRequest {
    @NotNull(message = "El monto es requerido")
    @Min(value = 1, message = "El monto debe ser mayor a 0")
    private BigDecimal monto;
    
    @NotNull(message = "La fecha de abono es requerida")
    private LocalDate fechaAbono;
    
    private String observaciones;
    
    private Boolean enviarComprobante = false;
    
    private Boolean esSoloIntereses = false;
}

