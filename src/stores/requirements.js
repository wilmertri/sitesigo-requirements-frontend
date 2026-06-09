import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export const useRequirementsStore = defineStore('requirements', () => {
    const requerimientos = ref([])
    const loading = ref(false)
    const error = ref(null)
    const filtros = ref({ estado: null, tipo: null, prioridad: null })

    async function cargarRequerimientos(filtrosParam = {}) {
        loading.value = true
        error.value = null
        try {
            const params = {}
            if (filtrosParam.estado) params.estado = filtrosParam.estado
            if (filtrosParam.tipo) params.tipo = filtrosParam.tipo
            if (filtrosParam.prioridad) params.prioridad = filtrosParam.prioridad

            const response = await api.get('/requerimientos', { params })
            requerimientos.value = response.data
        } catch (err) {
            error.value = err.response?.data?.detail || 'Error al cargar requerimientos'
        } finally {
            loading.value = false
        }
    }

    async function archivarRequerimiento(id) {
        const response = await api.delete(`/requerimientos/${id}`)
        requerimientos.value = requerimientos.value.filter(r => r.id !== id)
        return response.data
    }

    function limpiar() {
        requerimientos.value = []
        filtros.value = { estado: null, tipo: null, prioridad: null }
        error.value = null
    }

    return { requerimientos, loading, error, filtros, cargarRequerimientos, archivarRequerimiento, limpiar }
})
