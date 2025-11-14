package com.prestamos.controller;

import com.prestamos.config.SecurityUtils;
import com.prestamos.dto.LiquidacionResponse;
import com.prestamos.service.LiquidacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/liquidaciones")
@RequiredArgsConstructor
public class LiquidacionController {

    private final LiquidacionService liquidacionService;
    private final SecurityUtils securityUtils;

    @GetMapping("/cobradores/{cobradorId}")
    public ResponseEntity<LiquidacionResponse> obtenerLiquidacion(
        @PathVariable Long cobradorId,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin
    ) {
        Long prestamistaId = securityUtils.getCurrentUserId()
            .orElseThrow(() -> new IllegalStateException("No se pudo identificar al usuario autenticado"));

        LocalDate inicio = fechaInicio != null ? fechaInicio : LocalDate.now().withDayOfMonth(1);
        LocalDate fin = fechaFin != null ? fechaFin : LocalDate.now();

        LiquidacionResponse respuesta = liquidacionService.obtenerLiquidacion(
            prestamistaId,
            cobradorId,
            inicio,
            fin
        );

        return ResponseEntity.ok(respuesta);
    }
}

