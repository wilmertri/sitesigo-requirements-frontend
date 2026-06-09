import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export const useConfigStore = defineStore('config', () => {
    // Caché por proyecto para no re-fetchear en cada render
    const camposPorProyecto  = ref({})
    const estadosPorProyecto = ref({})

    async function fetchCampos(proyectoId) {
        if (camposPorProyecto.value[proyectoId]) return camposPorProyecto.value[proyectoId]
        const r = await api.get(`/proyectos/${proyectoId}/campos`)
        camposPorProyecto.value[proyectoId] = r.data
        return r.data
    }

    async function fetchEstados(proyectoId) {
        if (estadosPorProyecto.value[proyectoId]) return estadosPorProyecto.value[proyectoId]
        const r = await api.get(`/proyectos/${proyectoId}/estados`)
        estadosPorProyecto.value[proyectoId] = r.data
        return r.data
    }

    // No se cachea — resultado depende de las fechas en el momento
    async function calcularDiasHabiles(proyectoId, fechaInicio, fechaFinal) {
        const r = await api.get(`/proyectos/${proyectoId}/dias-habiles`, {
            params: { fecha_inicio: fechaInicio, fecha_final: fechaFinal }
        })
        return r.data
    }

    async function actualizarValores(requerimientoId, valoresAdicionales) {
        const r = await api.put(`/requerimientos/${requerimientoId}/valores`, valoresAdicionales)
        return r.data
    }

    // Invalida caché de un proyecto (útil tras crear/editar campos o estados)
    function invalidar(proyectoId) {
        delete camposPorProyecto.value[proyectoId]
        delete estadosPorProyecto.value[proyectoId]
    }

    return {
        camposPorProyecto,
        estadosPorProyecto,
        fetchCampos,
        fetchEstados,
        calcularDiasHabiles,
        actualizarValores,
        invalidar,
    }
})
