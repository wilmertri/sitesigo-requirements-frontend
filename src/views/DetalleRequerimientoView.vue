<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'
import { useConfigStore } from '../stores/config'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { useBadges } from '../composables/useBadges'
import api from '../services/api'
import AppLayout from '../components/AppLayout.vue'
import CamposConfigurables from '../components/CamposConfigurables.vue'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'
import Message from 'primevue/message'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'

const router      = useRouter()
const route       = useRoute()
const auth        = useAuthStore()
const confirm     = useConfirm()
const toast       = useToast()
const themeStore  = useThemeStore()
const configStore = useConfigStore()
const darkRef     = computed(() => themeStore.isDark)
const { estadoLabel, estadoStyle, prioridadLabel, prioridadStyle } = useBadges(darkRef)

const requerimiento   = ref(null)
const loading         = ref(true)
const error           = ref(null)
const nuevoEstado     = ref(null)
const cambiandoEstado = ref(false)

// ── Campos adicionales ────────────────────────────────────────────────────────
const editandoValores  = ref(false)
const valoresEdit      = ref({})
const guardandoValores = ref(false)

const puedeEditarValores = computed(() =>
    auth.isAdmin || auth.isSuperAdmin ||
    requerimiento.value?.autor_email === auth.user?.email
)

function onUpdateValores(v) { valoresEdit.value = v }

function abrirEdicionValores() {
    valoresEdit.value  = { ...(requerimiento.value?.valores_adicionales ?? {}) }
    editandoValores.value = true
}

async function guardarValores() {
    guardandoValores.value = true
    try {
        await configStore.actualizarValores(route.params.id, valoresEdit.value)
        requerimiento.value = { ...requerimiento.value, valores_adicionales: { ...valoresEdit.value } }
        editandoValores.value = false
        toast.add({ severity: 'success', summary: 'Actualizado', detail: 'Campos guardados correctamente', life: 3000 })
    } catch {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron guardar los cambios', life: 3000 })
    } finally {
        guardandoValores.value = false
    }
}

// ── Observaciones ─────────────────────────────────────────────────────────────
const editandoObs  = ref(false)
const valorObs     = ref('')
const guardandoObs = ref(false)
const camposProyecto   = ref([])
const hayObservaciones = computed(() =>
    camposProyecto.value.some(c => c.clave === 'observaciones')
)
const puedeEditarObs = computed(() => {
    const req = requerimiento.value
    if (!req || !hayObservaciones.value) return false
    const esCreador = (auth.user?.id && req.creado_por)
        ? auth.user.id === req.creado_por
        : auth.user?.email === req.autor_email
    return esCreador && !['Cerrado', 'Rechazado'].includes(req.estado)
})

function abrirEdicionObs() {
    valorObs.value    = requerimiento.value?.valores_adicionales?.observaciones ?? ''
    editandoObs.value = true
}

async function guardarObs() {
    guardandoObs.value = true
    try {
        await api.patch(`/requerimientos/${route.params.id}/observaciones`, {
            observaciones: valorObs.value
        })
        requerimiento.value = {
            ...requerimiento.value,
            valores_adicionales: {
                ...requerimiento.value.valores_adicionales,
                observaciones: valorObs.value,
            }
        }
        editandoObs.value = false
        toast.add({ severity: 'success', summary: 'Observaciones guardadas', life: 3000 })
    } catch (err) {
        const status = err.response?.status
        const detail = err.response?.data?.detail
        if (status === 403) {
            toast.add({ severity: 'error', summary: 'Sin permiso', detail: 'Solo el creador puede editar las observaciones', life: 4000 })
        } else if (status === 422) {
            toast.add({ severity: 'error', summary: 'No permitido', detail: typeof detail === 'string' ? detail : 'No se pueden editar las observaciones en este estado', life: 4000 })
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron guardar las observaciones', life: 3000 })
        }
    } finally {
        guardandoObs.value = false
    }
}

// ── Estado del proyecto ───────────────────────────────────────────────────────
const estadosProyecto         = ref([])
const nuevoEstadoProyecto     = ref(null)
const cambiandoEstadoProyecto = ref(false)

async function cambiarEstadoProyecto() {
    if (!nuevoEstadoProyecto.value) return
    cambiandoEstadoProyecto.value = true
    try {
        const r = await api.patch(`/requerimientos/${route.params.id}/estado-proyecto`, {
            estado_proyecto: nuevoEstadoProyecto.value
        })
        requerimiento.value = r.data
        toast.add({ severity: 'success', summary: 'Estado de proyecto actualizado', life: 3000 })
    } catch (err) {
        toast.add({ severity: 'error', summary: 'Error', detail: err.response?.data?.detail ?? 'No se pudo cambiar el estado', life: 3000 })
    } finally {
        cambiandoEstadoProyecto.value = false
    }
}

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
    'bug':                   { light: { bg: '#fee2e2', color: '#991b1b' }, dark: { bg: '#7f1d1d', color: '#fca5a5' } },
    'nueva funcionalidad':   { light: { bg: '#dbeafe', color: '#1e40af' }, dark: { bg: '#1e3a5f', color: '#93c5fd' } },
    'cambio en modulo':      { light: { bg: '#fef9c3', color: '#854d0e' }, dark: { bg: '#713f12', color: '#fde047' } },
    'mejora ux/rendimiento': { light: { bg: '#f0fdf4', color: '#166534' }, dark: { bg: '#14532d', color: '#86efac' } },
}

function tipoStyle(v) {
    const map = TIPO_COLOR[(v ?? '').toLowerCase()]
    if (!map) return themeStore.isDark ? 'background:#1e293b;color:#94a3b8' : 'background:#f3f4f6;color:#6b7280'
    const m = themeStore.isDark ? map.dark : map.light
    return `background:${m.bg};color:${m.color}`
}

async function cargar() {
    loading.value = true
    error.value   = null
    try {
        const r = await api.get(`/requerimientos/${route.params.id}`)
        requerimiento.value       = r.data
        nuevoEstado.value         = r.data.estado
        nuevoEstadoProyecto.value = r.data.estado_proyecto ?? null
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

onMounted(async () => {
    await cargar()
    if (auth.user?.proyecto_id) {
        const [estados, campos] = await Promise.all([
            configStore.fetchEstados(auth.user.proyecto_id),
            configStore.fetchCampos(auth.user.proyecto_id),
        ])
        estadosProyecto.value = estados
        camposProyecto.value  = campos
    }
})
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

      <!-- Campos adicionales -->
      <div v-if="auth.user?.proyecto_id" class="rounded-xl shadow-sm overflow-hidden"
           :class="themeStore.isDark ? 'bg-slate-800' : 'bg-white'">

        <!-- Header -->
        <div class="px-6 py-4 border-b flex items-center justify-between"
             :class="themeStore.isDark ? 'border-slate-700' : 'border-gray-100'">
          <div class="flex items-center gap-2 text-base font-semibold"
               :class="themeStore.isDark ? 'text-slate-200' : 'text-gray-700'">
            <i class="pi pi-sliders-h text-emerald-500"></i>
            Campos adicionales
          </div>
          <div v-if="!editandoObs" class="flex gap-2">
            <template v-if="editandoValores">
              <Button label="Guardar" icon="pi pi-check" size="small"
                      :loading="guardandoValores"
                      style="background:linear-gradient(135deg,#1e3a8a,#3b82f6);border:none"
                      @click="guardarValores" />
              <Button label="Cancelar" icon="pi pi-times" size="small"
                      severity="secondary" outlined :disabled="guardandoValores"
                      @click="editandoValores = false" />
            </template>
            <Button v-else-if="puedeEditarValores"
                    label="Editar" icon="pi pi-pencil" size="small"
                    severity="secondary" outlined
                    @click="abrirEdicionValores" />
          </div>
        </div>

        <div class="p-6 flex flex-col gap-5">

          <!-- Observaciones — sección dedicada con edición para el creador -->
          <div v-if="hayObservaciones">
            <div class="flex items-center justify-between mb-2">
              <p class="text-xs font-medium uppercase tracking-wide"
                 :class="themeStore.isDark ? 'text-slate-400' : 'text-gray-400'">
                Observaciones
              </p>
              <div v-if="editandoObs" class="flex gap-2">
                <Button label="Guardar" icon="pi pi-check" size="small"
                        :loading="guardandoObs"
                        style="background:linear-gradient(135deg,#1e3a8a,#3b82f6);border:none"
                        @click="guardarObs" />
                <Button label="Cancelar" icon="pi pi-times" size="small"
                        severity="secondary" outlined :disabled="guardandoObs"
                        @click="editandoObs = false" />
              </div>
              <Button v-else-if="puedeEditarObs && !editandoValores"
                      label="Editar observaciones" icon="pi pi-pencil"
                      size="small" severity="secondary" outlined
                      @click="abrirEdicionObs" />
            </div>

            <Textarea
              v-if="editandoObs"
              v-model="valorObs"
              :rows="4"
              fluid
              :auto-resize="false"
              placeholder="Ingresa las observaciones…"
            />
            <div v-else
                 class="min-h-[3rem] rounded-lg px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap"
                 :class="themeStore.isDark ? 'bg-slate-900 text-slate-300' : 'bg-slate-50 text-gray-700'">
              {{ requerimiento.valores_adicionales?.observaciones || '—' }}
            </div>
          </div>

          <!-- Resto de campos (excluye observaciones para no mostrarla dos veces) -->
          <CamposConfigurables
            :proyecto-id="auth.user.proyecto_id"
            :model-value="editandoValores ? valoresEdit : (requerimiento.valores_adicionales ?? {})"
            :readonly="!editandoValores"
            :exclude="hayObservaciones ? ['observaciones'] : []"
            @update:model-value="onUpdateValores"
          />

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

          <!-- Estado del proyecto -->
          <div v-if="estadosProyecto.length" class="border-t border-gray-100 pt-5">
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Estado del proyecto</p>
            <div class="flex gap-3 items-center">
              <Select
                v-model="nuevoEstadoProyecto"
                :options="estadosProyecto.map(e => ({ label: e.nombre, value: e.nombre }))"
                option-label="label"
                option-value="value"
                placeholder="Seleccionar estado"
                show-clear
                class="flex-1"
              />
              <Button
                label="Guardar"
                icon="pi pi-check"
                :loading="cambiandoEstadoProyecto"
                :disabled="!nuevoEstadoProyecto || nuevoEstadoProyecto === requerimiento.estado_proyecto"
                @click="cambiarEstadoProyecto"
              />
            </div>
            <p v-if="requerimiento.estado_proyecto" class="text-xs text-gray-400 mt-2">
              Estado actual: <span class="font-medium">{{ requerimiento.estado_proyecto }}</span>
            </p>
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
