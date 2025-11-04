import api from '../utils/api'

export const usuariosService = {
  // Obtener cobradores del prestamista
  async getCobradores(prestamistaId) {
    try {
      const response = await api.get('/cobradores')
      
      return response.data.map(cobrador => ({
        id: cobrador.id,
        email: cobrador.email,
        nombreCompleto: cobrador.nombreCompleto,
        telefono: cobrador.telefono,
        rol: 'COBRADOR',
        activo: cobrador.activo,
        numeroPrestamos: cobrador.numeroPrestamos || 0
      }))
    } catch (error) {
      console.error('Error fetching cobradores:', error)
      throw error
    }
  },

  // Crear cobrador
  async createCobrador(prestamistaId, cobradorData) {
    try {
      const response = await api.post('/cobradores', {
        email: cobradorData.email,
        password: cobradorData.password,
        nombreCompleto: cobradorData.nombreCompleto,
        telefono: cobradorData.telefono,
      })
      
      return {
        id: response.data.id,
        email: response.data.email,
        nombreCompleto: response.data.nombreCompleto,
        telefono: response.data.telefono,
        rol: 'COBRADOR',
        activo: response.data.activo
      }
    } catch (error) {
      console.error('Error creating cobrador:', error)
      throw error
    }
  },

  // Actualizar cobrador
  async updateCobrador(cobradorId, updates) {
    try {
      const updateData = {
        email: updates.email,
      }

      if (updates.nombreCompleto) updateData.nombreCompleto = updates.nombreCompleto
      if (updates.telefono) updateData.telefono = updates.telefono
      if (updates.password) updateData.password = updates.password

      const response = await api.put(`/cobradores/${cobradorId}`, updateData)

      return {
        id: response.data.id,
        email: response.data.email,
        nombreCompleto: response.data.nombreCompleto,
        telefono: response.data.telefono,
        activo: response.data.activo
      }
    } catch (error) {
      console.error('Error updating cobrador:', error)
      throw error
    }
  },

  // Desactivar cobrador
  async desactivarCobrador(cobradorId) {
    try {
      await api.delete(`/cobradores/${cobradorId}`)
    } catch (error) {
      console.error('Error deactivating cobrador:', error)
      throw error
    }
  }
}
