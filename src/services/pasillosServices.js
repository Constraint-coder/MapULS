import api from './api'

// Obtener todos los pasillos (público)
export async function getPasillo() {
  try {
    const response = await api.get('/pasillos')
    return response.data
  } catch (error) {
    console.error('Error al obtener pasillos:', error)
    throw error
  }
}

// Crear un nuevo pasillo (requiere login)
export async function crearPasillo(data) {
  try {
    console.log('Enviando datos a API:', JSON.stringify(data, null, 2))
    const response = await api.post('/pasillos', data)
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

// Editar un pasillo por ID (actualiza solo los campos enviados)
export async function editarPasillo(id, data) {
  try {
    const response = await api.patch(`/pasillos/${id}`, data)
    console.log('Pasillo actualizado:', response.data)
    return response.data
  } catch (error) {
    if (error.response) {
      console.error('Errores al editar pasillo:', error.response.data.errors)
      throw error.response.data
    } else {
      console.error('Error de conexión al editar pasillo:', error.message)
      throw error
    }
  }
}

// Eliminar un pasillo por ID
export async function eliminarPasillo(id) {
  try {
    const response = await api.delete(`/pasillos/${id}`)
    console.log('Pasillo eliminado:', response.data)
    return response.data
  } catch (error) {
    if (error.response) {
      console.error('Error al eliminar pasillo:', error.response.data)
      throw error.response.data
    } else {
      console.error('Error de conexión al eliminar pasillo:', error.message)
      throw error
    }
  }
}
