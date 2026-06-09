import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Interceptor: agrega token JWT en cada request
api.interceptors.request.use(config => {
    const token = localStorage.getItem('jwt_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Interceptor: maneja token expirado (no actúa en el endpoint de login)
api.interceptors.response.use(
    response => response,
    error => {
        const esEndpointPublico =
            error.config?.url?.includes('/auth/token') ||
            error.config?.url?.includes('/auth/registro')
        if (error.response?.status === 401 && !esEndpointPublico) {
            localStorage.removeItem('jwt_token')
            localStorage.removeItem('user')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default api
