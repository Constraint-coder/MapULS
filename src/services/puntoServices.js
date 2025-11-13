import api from './api'

// Obtener todas las referencias (público)
export async function getReferencia() {
  try {
    const response = await api.get('/puntos_referencias')
    return response.data
  } catch (error) {
    console.error('Error al obtener referencias:', error)
    throw error
  }
}

// Crear una nueva referencia (requiere login)
export async function crearReferencia(data) {
  try {
    console.log('Enviando datos a API:', JSON.stringify(data, null, 2))
    const response = await api.post('/puntos_referencias', data)
    console.log('Respuesta del servidor:', response.data)
    return response.data
  } catch (error) {
    if (error.response) {
      console.error('Errores de validación:', error.response.data.errors)
      throw error.response.data
    } else {
      console.error('Error de conexión:', error.message)
      throw error
    }
  }
}

// Editar una referencia por ID (actualiza solo los campos enviados)
export async function editarReferencia(id, data) {
  try {
    const response = await api.patch(`/puntos_referencias/${id}`, data)
    console.log('Referencia actualizada:', response.data)
    return response.data
  } catch (error) {
    if (error.response) {
      console.error('Errores al editar referencia:', error.response.data.errors)
      throw error.response.data
    } else {
      console.error('Error de conexión al editar referencia:', error.message)
      throw error
    }
  }
}

// Eliminar una referencia por ID
export async function eliminarReferencia(id) {
  try {
    const response = await api.delete(`/puntos_referencias/${id}`)
    console.log('Referencia eliminada:', response.data)
    return response.data
  } catch (error) {
    if (error.response) {
      console.error('Error al eliminar referencia:', error.response.data)
      throw error.response.data
    } else {
      console.error('Error de conexión al eliminar referencia:', error.message)
      throw error
    }
  }
}
