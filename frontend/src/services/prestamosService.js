import api from '../utils/api'

export const prestamosService = {
  // Obtener todos los préstamos del usuario actual
  async getPrestamos(userId, filters = {}) {
    try {
      const params = {}
      
      if (filters.estado && filters.estado !== 'TODOS') {
        params.estado = filters.estado
      }
      
      if (filters.search) {
        params.search = filters.search
      }
      
      const response = await api.get('/prestamos', { params })
      
      // Mapear los datos del backend a el formato esperado por el frontend
      return response.data.map(prestamo => ({
        id: prestamo.id,
        nombreCliente: prestamo.nombreCliente,
        telefono: prestamo.telefono,
        email: prestamo.email,
        montoPrestado: parseFloat(prestamo.montoPrestado),
        saldoPendiente: parseFloat(prestamo.saldoPendiente),
        numeroCuotas: prestamo.numeroCuotas,
        cuotasPagadas: prestamo.cuotasPagadas,
        frecuenciaPago: prestamo.frecuenciaPago,
        fechaInicio: prestamo.fechaInicio,
        fechaVencimiento: prestamo.fechaVencimiento,
        fechaCreacion: prestamo.fechaCreacion,
        estado: prestamo.estado,
        zona: prestamo.zona,
        cobradorId: prestamo.cobrador?.id,
        recordatoriosActivos: prestamo.recordatoriosActivos
      }))
    } catch (error) {
      console.error('Error fetching prestamos:', error)
      throw error
    }
  },

  // Obtener un préstamo por ID
  async getPrestamoById(prestamoId) {
    try {
      const response = await api.get(`/prestamos/${prestamoId}`)
      const data = response.data
      
      return {
        id: data.id,
        nombreCliente: data.nombreCliente,
        telefono: data.telefono,
        email: data.email,
        montoPrestado: parseFloat(data.montoPrestado),
        saldoPendiente: parseFloat(data.saldoPendiente),
        numeroCuotas: data.numeroCuotas,
        cuotasPagadas: data.cuotasPagadas,
        frecuenciaPago: data.frecuenciaPago,
        fechaInicio: data.fechaInicio,
        fechaVencimiento: data.fechaVencimiento,
        estado: data.estado,
        zona: data.zona,
        cobradorId: data.cobrador?.id,
        recordatoriosActivos: data.recordatoriosActivos
      }
    } catch (error) {
      console.error('Error fetching prestamo:', error)
      throw error
    }
  },

  // Crear nuevo préstamo
  async createPrestamo(prestamistaId, prestamoData) {
    try {
      const response = await api.post('/prestamos', {
        nombreCliente: prestamoData.nombreCliente,
        direccion: prestamoData.direccion || '',
        telefono: prestamoData.telefono,
        email: prestamoData.email || null,
        montoPrestado: prestamoData.montoPrestado,
        numeroCuotas: prestamoData.numeroCuotas,
        frecuenciaPago: prestamoData.frecuenciaPago,
        fechaInicio: prestamoData.fechaInicio,
        zona: prestamoData.zona || '',
        cobradorId: prestamoData.cobradorId || null,
        recordatoriosActivos: prestamoData.recordatoriosActivos !== false,
      })
      
      const data = response.data
      
      return {
        id: data.id,
        nombreCliente: data.nombreCliente,
        telefono: data.telefono,
        email: data.email,
        montoPrestado: parseFloat(data.montoPrestado),
        saldoPendiente: parseFloat(data.saldoPendiente),
        numeroCuotas: data.numeroCuotas,
        cuotasPagadas: data.cuotasPagadas,
        fechaVencimiento: data.fechaVencimiento,
        estado: data.estado,
        zona: data.zona
      }
    } catch (error) {
      console.error('Error creating prestamo:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Error al crear el préstamo'
      throw new Error(errorMessage)
    }
  },

  // Obtener cuotas de un préstamo
  async getCuotas(prestamoId) {
    try {
      const response = await api.get(`/prestamos/${prestamoId}/cuotas`)
      
      return response.data.map(cuota => ({
        id: cuota.id,
        numeroCuota: cuota.numeroCuota,
        monto: parseFloat(cuota.monto),
        fechaVencimiento: cuota.fechaVencimiento,
        fechaPago: cuota.fechaPago,
        estado: cuota.estado
      }))
    } catch (error) {
      console.error('Error fetching cuotas:', error)
      throw error
    }
  },

  // Registrar abono
  async registrarAbono(prestamoId, usuarioId, abonoData) {
    try {
      const response = await api.post(`/prestamos/${prestamoId}/abonos`, {
        monto: abonoData.monto,
        fechaAbono: abonoData.fechaAbono || new Date().toISOString().split('T')[0],
        observaciones: abonoData.observaciones || null,
      })
      
      return response.data
    } catch (error) {
      console.error('Error registering abono:', error)
      throw error
    }
  },

  // Obtener abonos de un préstamo
  async getAbonos(prestamoId) {
    try {
      const response = await api.get(`/prestamos/${prestamoId}/abonos`)
      
      return response.data.map(abono => ({
        id: abono.id,
        monto: parseFloat(abono.monto),
        fechaAbono: abono.fechaAbono,
        observaciones: abono.observaciones,
        usuarioId: abono.usuario?.id
      }))
    } catch (error) {
      console.error('Error fetching abonos:', error)
      throw error
    }
  },

  // Eliminar préstamo
  async deletePrestamo(prestamoId) {
    try {
      await api.delete(`/prestamos/${prestamoId}`)
    } catch (error) {
      console.error('Error deleting prestamo:', error)
      throw error
    }
  }
}
