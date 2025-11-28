import api, { sendFormData } from "./api";

// Obtener todos los destinos
export async function getDestino() {
  try {
    const response = await api.get('/puntos_destinos');
    return response.data;
  } catch (error) {
    console.error('Error al obtener destinos:', error);
    throw error;
  }
}

// Crear un nuevo destino
export async function crearDestino(data) {
  try {
    const token = localStorage.getItem('token');
    const response = await sendFormData('/puntos_destinos', data, 'post', {
      Authorization: `Bearer ${token}`
    });
    console.log('Respuesta del servidor:', response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Errores de Validación:', error.response.data.errors);
      throw error.response.data;
    } else {
      console.error('Error de conexión:', error.message);
      throw error;
    }
  }
}

// Obtener un destino por ID
export async function getDestinoById(id) {
  try {
    const response = await api.get(`/destinos/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener destino con id ${id}:`, error);
    throw error;
  }
}
export async function getDestinoByI(id) {
  try {
    const response = await api.get(`/destinos/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener destino con id ${id}:`, error);
    throw error;
  }
}

// Editar un destino por ID
export async function editarDestino(id, data) {
  try {
    const token = localStorage.getItem('token');
    const response = await sendFormData(`/puntos_destinos/${id}`, data, 'post', {
      Authorization: `Bearer ${token}`,
      'X-HTTP-Method-Override': 'PATCH' // o usa _method en FormData
    });
    console.log('Destino actualizado:', response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Errores al editar destino:', error.response.data.errors);
      throw error.response.data;
    } else {
      console.error('Error de conexión al editar destino:', error.message);
      throw error;
    }
  }
}


// Eliminar un destino por ID
export async function eliminarDestino(id) {
  try {
    const token = localStorage.getItem('token');
    const response = await api.delete(`/puntos_destinos/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Destino eliminado:', response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Error al eliminar destino:', error.response.data);
      throw error.response.data;
    } else {
      console.error('Error de conexión al eliminar destino:', error.message);
      throw error;
    }
  }
}
