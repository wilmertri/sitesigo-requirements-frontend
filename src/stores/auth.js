import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const useAuthStore = defineStore('auth', () => {
    const token = ref(localStorage.getItem('jwt_token') || null)
    const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

    const isAuthenticated = computed(() => !!token.value)
    const isSuperAdmin  = computed(() => user.value?.rol === 'super_admin')
    const isAdmin       = computed(() => user.value?.rol === 'administrador')
    const isFuncionario = computed(() => user.value?.rol === 'funcionario')

    async function login(email, password) {
        const formData = new FormData()
        formData.append('username', email)
        formData.append('password', password)

        const response = await api.post('/auth/token', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })

        token.value = response.data.access_token
        localStorage.setItem('jwt_token', token.value)

        const meResponse = await api.get('/auth/me')
        user.value = meResponse.data
        localStorage.setItem('user', JSON.stringify(user.value))

        return user.value
    }

    async function registro(datos) {
        const response = await api.post('/auth/registro', datos)
        return response.data
    }

    function logout() {
        token.value = null
        user.value = null
        localStorage.removeItem('jwt_token')
        localStorage.removeItem('user')
    }

    return {
        token, user,
        isAuthenticated, isSuperAdmin, isAdmin, isFuncionario,
        login, registro, logout
    }
})
