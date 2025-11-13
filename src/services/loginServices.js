import api from './api'

// 🔹 Login
export async function loginUsuario(email, password) {
  try {
    const response = await api.post('/login', { email, password })

    // Guardar token en localStorage
    localStorage.setItem('token', response.data.token)

    // Retornar datos del usuario si quieres
    return response.data

  } catch (error) {
    if (error.response) {
      console.error('❌ Error de login:', error.response.data)
      throw error.response.data
    } else {
      console.error('🌐 Error de conexión:', error.message)
      throw error
    }
  }
}

// 🔹 Registro de usuario
export async function registerUsuario(data) {
  try {
    const response = await api.post('/register', data)

    // Guardar token en localStorage
    localStorage.setItem('token', response.data.token)

    return response.data
  } catch (error) {
    if (error.response) {
      console.error('❌ Error de registro:', error.response.data)
      throw error.response.data
    } else {
      console.error('🌐 Error de conexión:', error.message)
      throw error
    }
  }
}

// 🔹 Logout
export async function logoutUsuario() {
  try {
    await api.post('/logout') // el token se envía automáticamente por el interceptor
    localStorage.removeItem('token')
  } catch (error) {
    console.error('❌ Error al cerrar sesión:', error)
    throw error
  }
}

// 🔹 Obtener usuario autenticado (opcional)
export async function getUsuario() {
  try {
    const response = await api.get('/me')
    return response.data
  } catch (error) {
    console.error('❌ Error al obtener usuario:', error)
    throw error
  }
}
