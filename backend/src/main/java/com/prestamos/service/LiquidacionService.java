package com.prestamos.service;

import com.prestamos.dto.LiquidacionResponse;
import com.prestamos.entity.Ruta;
import com.prestamos.entity.Usuario;
import com.prestamos.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;

@Service
@RequiredArgsConstructor
@Slf4j
public class LiquidacionService {

    private final UsuarioRepository usuarioRepository;

    public LiquidacionResponse obtenerLiquidacion(Long prestamistaId,
                                                  Long cobradorId,
                                                  LocalDate fechaInicio,
                                                  LocalDate fechaFin) {
        Usuario cobrador = usuarioRepository.findById(cobradorId)
            .orElseThrow(() -> new IllegalArgumentException("El cobrador solicitado no existe"));

        if (cobrador.getPrestamista() == null ||
            !cobrador.getPrestamista().getId().equals(prestamistaId)) {
            log.warn("El usuario {} intentó acceder a la liquidación del cobrador {} sin permisos",
                prestamistaId, cobradorId);
            throw new AccessDeniedException("No tienes permisos para consultar la liquidación de este cobrador");
        }

        String rutaPrincipal = cobrador.getRutasAsignadas()
            .stream()
            .min(Comparator.comparing(Ruta::getNombre, String::compareToIgnoreCase))
            .map(Ruta::getNombre)
            .orElse("Sin ruta asignada");

        log.info("Generando liquidación provisional para cobrador {} del {} al {}",
            cobradorId, fechaInicio, fechaFin);

        return LiquidacionResponse.builder()
            .cobrador(cobrador.getNombreCompleto())
            .ruta(rutaPrincipal)
            .baseTrabajador(BigDecimal.ZERO)
            .gastos(BigDecimal.ZERO)
            .ingresos(BigDecimal.ZERO)
            .pagos(BigDecimal.ZERO)
            .ventas(BigDecimal.ZERO)
            .efectivoAEntregar(BigDecimal.ZERO)
            .faltanteOSobrante(BigDecimal.ZERO)
            .efectivoEntregado(BigDecimal.ZERO)
            .papeleria(BigDecimal.ZERO)
            .pleno(BigDecimal.ZERO)
            .positivos(BigDecimal.ZERO)
            .cargueGastoPersonal(BigDecimal.ZERO)
            .build();
    }
}

