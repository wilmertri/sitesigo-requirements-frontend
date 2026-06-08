import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export const useProjectsStore = defineStore('projects', () => {
    const proyectos     = ref([])
    const proyectoActual = ref(null)
    const usuarios      = ref([])
    const loading       = ref(false)
    const error         = ref(null)

    async function cargarProyectos() {
        loading.value = true
        error.value   = null
        try {
            const response = await api.get('/proyectos')
            proyectos.value = response.data
        } catch (e) {
            error.value = e.response?.data?.detail || 'Error al cargar proyectos'
        } finally {
            loading.value = false
        }
    }

    async function crearProyecto(datos) {
        const response = await api.post('/proyectos', datos)
        proyectos.value.push(response.data)
        return response.data
    }

    async function cargarUsuarios(proyectoId) {
        loading.value = true
        error.value   = null
        try {
            const response = await api.get(`/proyectos/${proyectoId}/usuarios`)
            usuarios.value = response.data
        } catch (e) {
            error.value = e.response?.data?.detail || 'Error al cargar usuarios'
        } finally {
            loading.value = false
        }
    }

    async function agregarUsuario(proyectoId, datos) {
        const response = await api.post(`/proyectos/${proyectoId}/usuarios`, datos)
        usuarios.value.push(response.data)
        return response.data
    }

    return {
        proyectos, proyectoActual, usuarios,
        loading, error,
        cargarProyectos, crearProyecto,
        cargarUsuarios, agregarUsuario,
    }
})
