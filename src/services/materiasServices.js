// src/services/materiasServices.js
import api from './api'

// Obtener todas las materias (público)
export async function getMaterias() {
  try {
    const response = await api.get('/materias')
    return response.data
  } catch (error) {
    console.error('Error al obtener materias:', error)
    throw error
  }
}

// Crear una nueva materia (requiere login)
export async function crearMateria(data) {
  try {
    console.log(' Enviando datos a API:', JSON.stringify(data, null, 2))
    const response = await api.post('/materias', data)
    console.log(' Respuesta del servidor:', response.data)
    return response.data
  } catch (error) {
    if (error.response) {
      console.error(' Errores de validación:', error.response.data.errors)
      throw error.response.data
    } else {
      console.error('🌐 Error de conexión:', error.message)
      throw error
    }
  }
}

// Editar una materia por ID (actualiza solo los campos enviados)
export async function editarMateria(id, data) {
  try {
    const response = await api.patch(`/materias/${id}`, data)
    console.log(' Materia actualizada:', response.data)
    return response.data
  } catch (error) {
    if (error.response) {
      console.error(' Errores al editar materia:', error.response.data.errors)
      throw error.response.data
    } else {
      console.error(' Error de conexión al editar materia:', error.message)
      throw error
    }
  }
}

// Eliminar una materia por ID
export async function eliminarMateria(id) {
  try {
    const response = await api.delete(`/materias/${id}`)
    console.log(' Materia eliminada:', response.data)
    return response.data
  } catch (error) {
    if (error.response) {
      console.error(' Error al eliminar materia:', error.response.data)
      throw error.response.data
    } else {
      console.error('🌐 Error de conexión al eliminar materia:', error.message)
      throw error
    }
  }
}
