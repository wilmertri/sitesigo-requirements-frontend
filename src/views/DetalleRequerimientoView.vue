<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { useBadges } from '../composables/useBadges'
import api from '../services/api'
import AppLayout from '../components/AppLayout.vue'
import Select from 'primevue/select'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'
import Message from 'primevue/message'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'

const router  = useRouter()
const route   = useRoute()
const auth    = useAuthStore()
const confirm = useConfirm()
const toast   = useToast()
const { estadoLabel, estadoStyle, prioridadLabel, prioridadStyle } = useBadges()

const requerimiento   = ref(null)
const loading         = ref(true)
const error           = ref(null)
const nuevoEstado     = ref(null)
const cambiandoEstado = ref(false)

const opcionesEstado = [
    { label: 'En analisis',   value: 'En analisis' },
    { label: 'En desarrollo', value: 'En desarrollo' },
    { label: 'Resuelto',      value: 'Resuelto' },
    { label: 'Cerrado',       value: 'Cerrado' },
    { label: 'Rechazado',     value: 'Rechazado' },
]

const estadosPipeline = [
    { valor: 'Nuevo',         label: 'Nuevo' },
    { valor: 'En analisis',   label: 'En análisis' },
    { valor: 'En desarrollo', label: 'En desarrollo' },
    { valor: 'Resuelto',      label: 'Resuelto' },
    { valor: 'Cerrado',       label: 'Cerrado' },
]

const pipelineIndex = computed(() =>
    estadosPipeline.findIndex(e => e.valor === requerimiento.value?.estado)
)

function esEstadoActual(estado) {
    return estado.valor === requerimiento.value?.estado
}

function esEstadoPasado(estado) {
    const idx = estadosPipeline.findIndex(e => e.valor === estado.valor)
    return idx !== -1 && idx < pipelineIndex.value
}

function formatearFecha(fecha) {
    if (!fecha) return '—'
    return new Date(fecha).toLocaleDateString('es-CO', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
}

function formatFecha(f) {
    if (!f) return '—'
    return new Date(f).toLocaleDateString('es-CO', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
}

const TIPO_COLOR = {
    'bug':                  { bg: '#fee2e2', color: '#991b1b' },
    'nueva funcionalidad':  { bg: '#dbeafe', color: '#1e40af' },
    'cambio en modulo':     { bg: '#fef9c3', color: '#854d0e' },
    'mejora ux/rendimiento':{ bg: '#f0fdf4', color: '#166534' },
}

function tipoStyle(v) {
    const s = TIPO_COLOR[(v ?? '').toLowerCase()] ?? { bg: '#f3f4f6', color: '#6b7280' }
    return `background:${s.bg};color:${s.color}`
}

async function cargar() {
    loading.value = true
    error.value   = null
    try {
        const r = await api.get(`/requerimientos/${route.params.id}`)
        requerimiento.value = r.data
        nuevoEstado.value   = r.data.estado
    } catch (err) {
        error.value = err.response?.status === 404
            ? 'Requerimiento no encontrado.'
            : 'Error al cargar el requerimiento.'
    } finally {
        loading.value = false
    }
}

async function cambiarEstado() {
    if (!nuevoEstado.value || nuevoEstado.value === requerimiento.value.estado) return
    cambiandoEstado.value = true
    try {
        const r = await api.patch(`/requerimientos/${route.params.id}/estado`, { nuevo_estado: nuevoEstado.value })
        requerimiento.value = r.data
        nuevoEstado.value   = r.data.estado
        toast.add({ severity: 'success', summary: 'Estado actualizado', detail: estadoLabel(r.data.estado), life: 3000 })
    } catch (err) {
        const msg = err.response?.data?.detail ?? 'No se pudo cambiar el estado'
        toast.add({ severity: 'error', summary: 'Error', detail: msg, life: 3000 })
    } finally {
        cambiandoEstado.value = false
    }
}

function confirmarArchivar() {
    confirm.require({
        message:     `¿Archivar el requerimiento #${route.params.id}? Esta acción marcará el requerimiento como archivado.`,
        header:      'Confirmar archivo',
        icon:        'pi pi-exclamation-triangle',
        acceptLabel: 'Archivar',
        rejectLabel: 'Cancelar',
        acceptClass: 'p-button-danger',
        accept: async () => {
            try {
                await api.delete(`/requerimientos/${route.params.id}`)
                toast.add({ severity: 'success', summary: 'Archivado', detail: 'Requerimiento archivado correctamente', life: 2000 })
                setTimeout(() => router.push('/dashboard'), 800)
            } catch {
                toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo archivar', life: 3000 })
            }
        }
    })
}

onMounted(cargar)
</script>

<template>
  <AppLayout>
    <Toast position="top-right" />
    <ConfirmDialog />

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-24">
      <ProgressSpinner style="width:50px;height:50px" strokeWidth="4" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="max-w-lg">
      <Message severity="error" :closable="false">{{ error }}</Message>
      <Button label="Volver al Dashboard" icon="pi pi-arrow-left" text class="mt-4" @click="router.push('/dashboard')" />
    </div>

    <!-- Contenido -->
    <div v-else-if="requerimiento" class="max-w-3xl flex flex-col gap-5">

      <!-- Encabezado -->
      <div class="flex items-start gap-3">
        <Button icon="pi pi-arrow-left" text rounded size="small" severity="secondary" @click="router.push('/dashboard')" />
        <div class="flex-1">
          <div class="flex items-center gap-2 flex-wrap mb-2">
            <span class="px-2 py-0.5 rounded text-xs font-semibold" style="background:#f1f5f9;color:#64748b">
              #{{ requerimiento.id }}
            </span>
            <span class="px-2 py-0.5 rounded text-xs font-semibold" :style="tipoStyle(requerimiento.tipo)">
              {{ requerimiento.tipo || '—' }}
            </span>
            <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :style="estadoStyle(requerimiento.estado)">
              {{ estadoLabel(requerimiento.estado) }}
            </span>
          </div>
          <h1 class="text-2xl font-bold text-gray-800 mb-2">{{ requerimiento.titulo }}</h1>
          <div class="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
            <span class="flex items-center gap-1">
              <i class="pi pi-user text-xs"></i>{{ requerimiento.autor_email || '—' }}
            </span>
            <span>·</span>
            <span class="flex items-center gap-1">
              <i class="pi pi-calendar text-xs"></i>{{ formatearFecha(requerimiento.creado_en) }}
            </span>
            <span>·</span>
            <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :style="prioridadStyle(requerimiento.prioridad)">
              {{ prioridadLabel(requerimiento.prioridad) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Timeline de estados -->
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-6">Progreso del requerimiento</h3>
        <div class="flex items-start w-full">
          <template v-for="(estado, index) in estadosPipeline" :key="estado.valor">
            <div class="flex flex-col items-center">
              <div :class="[
                'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                esEstadoPasado(estado) ? 'bg-green-500 text-white' :
                esEstadoActual(estado) ? 'text-white ring-4 ring-blue-100' :
                'bg-gray-200 text-gray-400'
              ]" :style="esEstadoActual(estado) ? 'background:#1e3a8a' : ''">
                <i v-if="esEstadoPasado(estado)" class="pi pi-check text-xs"></i>
                <span v-else>{{ index + 1 }}</span>
              </div>
              <span class="text-xs mt-2 text-center font-medium text-gray-600 w-20 leading-tight">{{ estado.label }}</span>
            </div>
            <div
              v-if="index < estadosPipeline.length - 1"
              :class="[
                'flex-1 h-1 mx-2 rounded mt-5 transition-all',
                esEstadoPasado(estadosPipeline[index + 1]) || esEstadoActual(estadosPipeline[index + 1])
                  ? 'bg-blue-300' : 'bg-gray-200'
              ]"
            ></div>
          </template>
        </div>
      </div>

      <!-- Info principal -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100">
          <div class="flex items-center gap-2 text-base font-semibold text-gray-700">
            <i class="pi pi-info-circle text-blue-600"></i>
            Información del requerimiento
          </div>
        </div>
        <div class="p-6">
          <div class="mb-5">
            <p class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Descripción</p>
            <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">{{ requerimiento.descripcion }}</p>
          </div>
          <div class="grid grid-cols-2 gap-x-8 gap-y-4 border-t border-gray-100 pt-4">
            <div>
              <p class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Tipo</p>
              <p class="text-sm text-gray-700 font-medium">{{ requerimiento.tipo || '—' }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Prioridad</p>
              <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :style="prioridadStyle(requerimiento.prioridad)">
                {{ prioridadLabel(requerimiento.prioridad) }}
              </span>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Autor</p>
              <p class="text-sm text-gray-700">{{ requerimiento.autor_email || '—' }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Rol del autor</p>
              <p class="text-sm text-gray-700 capitalize">{{ requerimiento.autor_rol || '—' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Historial en timeline vertical -->
      <div v-if="requerimiento.historial?.length" class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100">
          <div class="flex items-center gap-2 text-base font-semibold text-gray-700">
            <i class="pi pi-history text-blue-600"></i>
            Historial de cambios
          </div>
        </div>
        <div class="p-6">
          <div class="flex flex-col">
            <div
              v-for="(h, i) in requerimiento.historial"
              :key="i"
              class="flex items-start gap-4"
            >
              <div class="flex flex-col items-center shrink-0">
                <div class="w-3 h-3 rounded-full mt-1" style="background:#3b82f6"></div>
                <div v-if="i < requerimiento.historial.length - 1" class="w-px flex-1 bg-gray-200 mt-1 min-h-8"></div>
              </div>
              <div class="flex-1 pb-5">
                <div class="flex items-center gap-2 flex-wrap mb-1">
                  <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :style="estadoStyle(h.estado_anterior)">
                    {{ estadoLabel(h.estado_anterior) }}
                  </span>
                  <i class="pi pi-arrow-right text-gray-400 text-xs"></i>
                  <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :style="estadoStyle(h.estado_nuevo)">
                    {{ estadoLabel(h.estado_nuevo) }}
                  </span>
                </div>
                <p class="text-xs text-gray-400">{{ h.usuario || '—' }} · {{ formatFecha(h.fecha) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel Admin -->
      <div
        v-if="auth.isAdmin || auth.isSuperAdmin"
        class="bg-white rounded-xl shadow-sm overflow-hidden border-l-4"
        style="border-left-color:#1e3a8a"
      >
        <div class="px-6 py-4 border-b border-gray-100">
          <div class="flex items-center gap-2 text-base font-semibold" style="color:#1e3a8a">
            <i class="pi pi-cog"></i>
            Gestionar requerimiento
          </div>
        </div>
        <div class="p-6 flex flex-col gap-5">
          <!-- Cambiar estado -->
          <div>
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Cambiar estado</p>
            <div class="flex gap-3 items-center">
              <Select
                v-model="nuevoEstado"
                :options="opcionesEstado"
                option-label="label"
                option-value="value"
                class="flex-1"
              />
              <Button
                label="Guardar"
                icon="pi pi-check"
                :loading="cambiandoEstado"
                :disabled="nuevoEstado === requerimiento.estado"
                @click="cambiarEstado"
              />
            </div>
          </div>

          <!-- Archivar -->
          <div class="border-t border-gray-100 pt-5">
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Zona de peligro</p>
            <Button
              label="Archivar Requerimiento"
              icon="pi pi-inbox"
              severity="danger"
              outlined
              @click="confirmarArchivar"
            />
          </div>
        </div>
      </div>

    </div>
  </AppLayout>
</template>
