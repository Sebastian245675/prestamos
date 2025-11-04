import api from '../utils/api'

export const movimientosService = {
  // Obtener todos los movimientos del usuario
  async getMovimientos(userId, filters = {}) {
    try {
      const params = {}
      
      if (filters.tipo && filters.tipo !== 'TODOS') {
        params.tipo = filters.tipo
      }
      
      if (filters.fechaDesde) {
        params.fechaDesde = filters.fechaDesde
      }
      
      if (filters.fechaHasta) {
        params.fechaHasta = filters.fechaHasta
      }
      
      const response = await api.get('/movimientos', { params })
      
      return response.data.map(movimiento => ({
        id: movimiento.id,
        tipo: movimiento.tipo,
        monto: parseFloat(movimiento.monto),
        descripcion: movimiento.descripcion,
        fecha: movimiento.fecha,
        observaciones: movimiento.observaciones
      }))
    } catch (error) {
      console.error('Error fetching movimientos:', error)
      throw error
    }
  },

  // Crear movimiento
  async createMovimiento(userId, movimientoData) {
    try {
      const response = await api.post('/movimientos', {
        tipo: movimientoData.tipo,
        monto: movimientoData.monto,
        descripcion: movimientoData.descripcion,
        fecha: movimientoData.fecha || new Date().toISOString().split('T')[0],
        observaciones: movimientoData.observaciones || null,
      })
      
      return {
        id: response.data.id,
        tipo: response.data.tipo,
        monto: parseFloat(response.data.monto),
        descripcion: response.data.descripcion,
        fecha: response.data.fecha,
        observaciones: response.data.observaciones
      }
    } catch (error) {
      console.error('Error creating movimiento:', error)
      throw error
    }
  },

  // Obtener resumen de movimientos
  async getResumen(userId) {
    try {
      const response = await api.get('/movimientos/resumen')
      return response.data
    } catch (error) {
      console.error('Error fetching resumen:', error)
      throw error
    }
  },

  // Eliminar movimiento
  async deleteMovimiento(movimientoId) {
    try {
      await api.delete(`/movimientos/${movimientoId}`)
    } catch (error) {
      console.error('Error deleting movimiento:', error)
      throw error
    }
  }
}
