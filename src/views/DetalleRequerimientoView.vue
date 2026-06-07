<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { useBadges } from '../composables/useBadges'
import api from '../services/api'
import AppLayout from '../components/AppLayout.vue'
import Card from 'primevue/card'
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

const requerimiento    = ref(null)
const loading          = ref(true)
const error            = ref(null)
const nuevoEstado      = ref(null)
const cambiandoEstado  = ref(false)

const TIPO_LABEL = {
    bug: 'Bug / Defecto', funcional: 'Nueva funcionalidad',
    no_funcional: 'Cambio en módulo', mejora: 'Mejora UX/rendimiento',
}

const opcionesEstado = [
    { label: 'En analisis',   value: 'En analisis' },
    { label: 'En desarrollo', value: 'En desarrollo' },
    { label: 'Resuelto',      value: 'Resuelto' },
    { label: 'Cerrado',       value: 'Cerrado' },
    { label: 'Rechazado',     value: 'Rechazado' },
]

function formatFecha(f) {
    if (!f) return '—'
    return new Date(f).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
function tipoLabel(v) { return TIPO_LABEL[(v ?? '').toLowerCase()] ?? v }

// ── Carga ──────────────────────────────────────────────────────────────────
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

// ── Cambiar estado ─────────────────────────────────────────────────────────
async function cambiarEstado() {
    if (!nuevoEstado.value || nuevoEstado.value === requerimiento.value.estado) return
    cambiandoEstado.value = true
    try {
        const r = await api.patch(`/requerimientos/${route.params.id}/estado`, { estado: nuevoEstado.value })
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

// ── Archivar ───────────────────────────────────────────────────────────────
function confirmarArchivar() {
    confirm.require({
        message: `¿Archivar el requerimiento #${route.params.id}? Esta acción marcará el requerimiento como archivado.`,
        header: 'Confirmar archivo',
        icon: 'pi pi-exclamation-triangle',
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
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-center gap-3">
          <Button icon="pi pi-arrow-left" text rounded size="small" severity="secondary" @click="router.push('/dashboard')" />
          <div>
            <p class="text-xs text-slate-500 font-medium mb-0.5">Requerimiento #{{ requerimiento.id }}</p>
            <h1 class="text-xl font-bold text-slate-800 leading-tight">{{ requerimiento.titulo }}</h1>
          </div>
        </div>
        <span
          class="px-3 py-1 rounded-full text-sm font-semibold shrink-0"
          :style="estadoStyle(requerimiento.estado)"
        >
          {{ estadoLabel(requerimiento.estado) }}
        </span>
      </div>

      <!-- Info principal -->
      <Card class="shadow-sm">
        <template #title>
          <div class="flex items-center gap-2 text-base">
            <i class="pi pi-info-circle text-blue-600"></i>
            Información del requerimiento
          </div>
        </template>
        <template #content>
          <!-- Descripción -->
          <div class="mb-5">
            <p class="text-sm font-medium text-slate-500 mb-1">Descripción</p>
            <p class="text-slate-700 leading-relaxed whitespace-pre-wrap">{{ requerimiento.descripcion }}</p>
          </div>

          <!-- Metadatos en grid -->
          <div class="grid grid-cols-2 gap-x-8 gap-y-4 border-t border-slate-100 pt-4">
            <div>
              <p class="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Tipo</p>
              <p class="text-sm text-slate-700 font-medium">{{ tipoLabel(requerimiento.tipo) }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Prioridad</p>
              <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :style="prioridadStyle(requerimiento.prioridad)">
                {{ prioridadLabel(requerimiento.prioridad) }}
              </span>
            </div>
            <div>
              <p class="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Autor</p>
              <p class="text-sm text-slate-700">{{ requerimiento.autor || requerimiento.usuario?.nombre || requerimiento.usuario?.email || '—' }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Fecha de creación</p>
              <p class="text-sm text-slate-700">{{ formatFecha(requerimiento.fecha_creacion) }}</p>
            </div>
          </div>
        </template>
      </Card>

      <!-- Historial de cambios (si el backend lo incluye) -->
      <Card v-if="requerimiento.historial?.length" class="shadow-sm">
        <template #title>
          <div class="flex items-center gap-2 text-base">
            <i class="pi pi-history text-blue-600"></i>
            Historial de cambios
          </div>
        </template>
        <template #content>
          <div class="flex flex-col gap-3">
            <div
              v-for="(h, i) in requerimiento.historial"
              :key="i"
              class="flex items-start gap-3"
            >
              <!-- Timeline dot -->
              <div class="flex flex-col items-center mt-1">
                <div class="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></div>
                <div v-if="i < requerimiento.historial.length - 1" class="w-px flex-1 bg-slate-200 mt-1 min-h-6"></div>
              </div>
              <!-- Content -->
              <div class="flex-1 pb-3">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :style="estadoStyle(h.estado_anterior)">
                    {{ estadoLabel(h.estado_anterior) }}
                  </span>
                  <i class="pi pi-arrow-right text-slate-400 text-xs"></i>
                  <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :style="estadoStyle(h.estado_nuevo)">
                    {{ estadoLabel(h.estado_nuevo) }}
                  </span>
                </div>
                <p class="text-xs text-slate-500 mt-1">
                  {{ h.usuario || '—' }} · {{ formatFecha(h.fecha) }}
                </p>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Panel Admin: Cambiar estado + Archivar -->
      <Card v-if="auth.isAdmin" class="shadow-sm border border-orange-100">
        <template #title>
          <div class="flex items-center gap-2 text-base text-orange-700">
            <i class="pi pi-shield"></i>
            Acciones de administrador
          </div>
        </template>
        <template #content>
          <div class="flex flex-col gap-4">
            <!-- Cambiar estado -->
            <div>
              <p class="text-sm font-medium text-slate-600 mb-2">Cambiar estado</p>
              <div class="flex gap-3 items-end">
                <div class="flex-1">
                  <Select
                    v-model="nuevoEstado"
                    :options="opcionesEstado"
                    option-label="label"
                    option-value="value"
                    fluid
                  />
                </div>
                <Button
                  label="Cambiar Estado"
                  icon="pi pi-refresh"
                  :loading="cambiandoEstado"
                  :disabled="nuevoEstado === requerimiento.estado"
                  @click="cambiarEstado"
                />
              </div>
            </div>

            <!-- Separador -->
            <div class="border-t border-orange-100 pt-4">
              <p class="text-sm font-medium text-slate-600 mb-2">Zona de peligro</p>
              <Button
                label="Archivar Requerimiento"
                icon="pi pi-inbox"
                severity="danger"
                outlined
                @click="confirmarArchivar"
              />
            </div>
          </div>
        </template>
      </Card>
    </div>
  </AppLayout>
</template>
