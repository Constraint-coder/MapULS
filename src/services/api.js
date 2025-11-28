import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
});

// Para peticiones JSON (default)
api.defaults.headers["Content-Type"] = "application/json";

// Interceptor de token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Función para enviar FormData (archivo + datos)
export const sendFormData = (url, formData, method = 'post', extraHeaders = {}) => {
  return api({
    method,
    url,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
      ...extraHeaders
    }
  });
};


export default api;
