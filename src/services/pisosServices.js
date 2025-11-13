import api from './api'

// Obtener todos los pisos (público)
export async function getPisos() {
  try {
    const response = await api.get('/pisos')
    return response.data
  } catch (error) {
    console.error('Error al obtener pisos:', error)
    throw error
  }
}

// Crear un nuevo piso (requiere login)
export async function crearPisos(data) {
  try {
    console.log('Enviando datos a API:', JSON.stringify(data, null, 2))
    const response = await api.post('/pisos', data)
    console.log('Respuesta del servidor:', response.data)
    return response.data
  } catch (error) {
    if (error.response) {
      console.error('Errores de Validación:', error.response.data.errors)
      throw error.response.data
    } else {
      console.error('Error de conexión:', error.message)
      throw error
    }
  }
}

// Editar un piso por ID (actualiza solo los campos enviados)
export async function editarPisos(id, data) {
  try {
    const response = await api.patch(`/pisos/${id}`, data)
    console.log('Piso actualizado:', response.data)
    return response.data
  } catch (error) {
    if (error.response) {
      console.error('Errores al editar piso:', error.response.data.errors)
      throw error.response.data
    } else {
      console.error('Error de conexión al editar piso:', error.message)
      throw error
    }
  }
}

// Eliminar un piso por ID
export async function eliminarPisos(id) {
  try {
    const response = await api.delete(`/pisos/${id}`)
    console.log('Piso eliminado:', response.data)
    return response.data
  } catch (error) {
    if (error.response) {
      console.error('Error al eliminar piso:', error.response.data)
      throw error.response.data
    } else {
      console.error('Error de conexión al eliminar piso:', error.message)
      throw error
    }
  }
}
