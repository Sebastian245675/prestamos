package com.prestamos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LiquidacionResponse {

    private String ruta;
    private String cobrador;

    private BigDecimal baseTrabajador;
    private BigDecimal gastos;
    private BigDecimal ingresos;
    private BigDecimal pagos;
    private BigDecimal ventas;

    private BigDecimal efectivoAEntregar;
    private BigDecimal faltanteOSobrante;
    private BigDecimal efectivoEntregado;
    private BigDecimal papeleria;

    private BigDecimal pleno;
    private BigDecimal positivos;
    private BigDecimal cargueGastoPersonal;

    @Builder.Default
    private List<ClienteRenovado> clientesRenovados = Collections.emptyList();

    @Builder.Default
    private List<ClientePagado> clientesPagados = Collections.emptyList();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClienteRenovado {
        private Long id;
        private LocalDate fechaRegistro;
        private String estado;
        private String cedula;
        private String cliente;
        private String telefono;
        private BigDecimal debe;
        private BigDecimal ultimoSaldo;
        private BigDecimal valorAEntregar;
        private BigDecimal valorVenta;
        private BigDecimal papeleria;
        private Integer domingo;
        private Integer diasAtrasados;
        private Integer diasVencidos;
        private Integer cuotasAdelantadas;
        private BigDecimal valorCuota;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClientePagado {
        private Long id;
        private LocalDate fechaPagoTotal;
        private String cedula;
        private String cliente;
        private BigDecimal valorTotal;
        private BigDecimal ultimoSaldo;
        private String modalidad;
        private BigDecimal valorPago;
        private LocalDate fechaPago;
        private Integer dias;
        private BigDecimal valorCuota;
    }
}

