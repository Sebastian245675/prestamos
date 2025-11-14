import api from '../utils/api'

export const liquidacionService = {
  async getLiquidacion(cobradorId, { fechaInicio, fechaFin } = {}) {
    const params = {}
    if (fechaInicio) params.fechaInicio = fechaInicio
    if (fechaFin) params.fechaFin = fechaFin

    const { data } = await api.get(`/liquidaciones/cobradores/${cobradorId}`, { params })
    return data
  },
}

