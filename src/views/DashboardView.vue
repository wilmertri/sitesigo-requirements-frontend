<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useRequirementsStore } from '../stores/requirements'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import AppLayout from '../components/AppLayout.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Select from 'primevue/select'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import Message from 'primevue/message'

const router  = useRouter()
const auth    = useAuthStore()
const req     = useRequirementsStore()
const confirm = useConfirm()
const toast   = useToast()

// ── Filtros ───────────────────────────────────────────────────────────────────
const filtroEstado    = ref(null)
const filtroTipo      = ref(null)
const filtroPrioridad = ref(null)

const opcionesEstado = [
    { label: 'Nuevo',          value: 'Nuevo' },
    { label: 'En analisis',    value: 'En analisis' },
    { label: 'En desarrollo',  value: 'En desarrollo' },
    { label: 'Resuelto',       value: 'Resuelto' },
    { label: 'Cerrado',        value: 'Cerrado' },
    { label: 'Rechazado',      value: 'Rechazado' },
    { label: 'Archivado',      value: 'Archivado' },
]

const opcionesTipo = [
    { label: 'Bug',                   value: 'Bug' },
    { label: 'Nueva funcionalidad',   value: 'Nueva funcionalidad' },
    { label: 'Cambio en modulo',      value: 'Cambio en modulo' },
    { label: 'Mejora UX/rendimiento', value: 'Mejora UX/rendimiento' },
]

const opcionesPrioridad = [
    { label: 'Alta',  value: 'Alta' },
    { label: 'Media', value: 'Media' },
    { label: 'Baja',  value: 'Baja' },
]

function aplicarFiltros() {
    req.cargarRequerimientos({
        estado:    filtroEstado.value,
        tipo:      filtroTipo.value,
        prioridad: filtroPrioridad.value,
    })
}

function limpiarFiltros() {
    filtroEstado.value    = null
    filtroTipo.value      = null
    filtroPrioridad.value = null
    req.cargarRequerimientos({})
}

// ── Acciones de tabla ──────────────────────────────────────────────────────────
function navegarDetalle(event) {
    router.push(`/requerimientos/${event.data.id}`)
}

function confirmarArchivar(requerimiento) {
    confirm.require({
        message:     `¿Archivar el requerimiento #${requerimiento.id} — "${requerimiento.titulo}"?`,
        header:      'Confirmar archivo',
        icon:        'pi pi-inbox',
        acceptLabel: 'Archivar',
        rejectLabel: 'Cancelar',
        accept: async () => {
            try {
                await req.archivarRequerimiento(requerimiento.id)
                toast.add({ severity: 'success', summary: 'Archivado', detail: 'Requerimiento archivado correctamente', life: 3000 })
            } catch {
                toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo archivar el requerimiento', life: 3000 })
            }
        }
    })
}

// ── Helpers de badge ──────────────────────────────────────────────────────────
const ESTADO = {
    nuevo:         { label: 'Nuevo',         bg: '#dbeafe', color: '#1e40af' },
    en_analisis:   { label: 'En análisis',   bg: '#fef9c3', color: '#854d0e' },
    en_desarrollo: { label: 'En desarrollo', bg: '#ffedd5', color: '#9a3412' },
    resuelto:      { label: 'Resuelto',      bg: '#dcfce7', color: '#166534' },
    cerrado:       { label: 'Cerrado',       bg: '#f3f4f6', color: '#6b7280' },
    rechazado:     { label: 'Rechazado',     bg: '#fee2e2', color: '#991b1b' },
    archivado:     { label: 'Archivado',     bg: '#d1d5db', color: '#374151' },
}
const PRIORIDAD = {
    alta:  { label: 'Alta',  bg: '#fee2e2', color: '#991b1b' },
    media: { label: 'Media', bg: '#fef9c3', color: '#854d0e' },
    baja:  { label: 'Baja',  bg: '#dcfce7', color: '#166534' },
}
const DEFAULT_BADGE = { bg: '#f3f4f6', color: '#6b7280' }

function normalize(v)     { return (v ?? '').toLowerCase().replace(/\s+/g, '_') }
function estadoLabel(v)   { return ESTADO[normalize(v)]?.label ?? v }
function estadoStyle(v)   { const e = ESTADO[normalize(v)] ?? DEFAULT_BADGE; return `background:${e.bg};color:${e.color}` }
function prioridadLabel(v){ return PRIORIDAD[normalize(v)]?.label ?? v }
function prioridadStyle(v){ const p = PRIORIDAD[normalize(v)] ?? DEFAULT_BADGE; return `background:${p.bg};color:${p.color}` }
function tipoLabel(v)     { return v ?? '—' }
function formatFecha(f)   {
    if (!f) return '—'
    return new Date(f).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ── Métricas ───────────────────────────────────────────────────────────────────
const metricas = computed(() => {
    const reqs = req.requerimientos
    return {
        total:         reqs.length,
        pendientes:    reqs.filter(r => r.estado === 'Nuevo' || r.estado === 'En analisis' || r.estado === 'En desarrollo').length,
        resueltos:     reqs.filter(r => r.estado === 'Resuelto').length,
        alta_prioridad: reqs.filter(r => r.prioridad === 'Alta').length,
    }
})

const saludo = computed(() => {
    const hora = new Date().getHours()
    if (hora < 12) return 'Buenos días'
    if (hora < 18) return 'Buenas tardes'
    return 'Buenas noches'
})

const fechaHoy = computed(() => {
    const fecha = new Date().toLocaleDateString('es-CO', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })
    return fecha.charAt(0).toUpperCase() + fecha.slice(1)
})

onMounted(() => req.cargarRequerimientos({}))
</script>

<template>
  <AppLayout>
    <Toast position="top-right" />
    <ConfirmDialog />

    <!-- Saludo + botón nuevo -->
    <div class="flex items-start justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">
          {{ saludo }}, {{ auth.user?.nombre || auth.user?.email }}
        </h1>
        <p class="text-gray-500 text-sm mt-1">{{ fechaHoy }}</p>
      </div>
      <Button
        label="Nuevo Requerimiento"
        icon="pi pi-plus"
        @click="router.push('/requerimientos/nuevo')"
      />
    </div>

    <!-- Cards de métricas -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <!-- Total -->
      <div class="bg-white rounded-xl p-6 shadow-sm border-l-4" style="border-left-color:#0f2557">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 mb-1">Total requerimientos</p>
            <p class="text-3xl font-bold text-gray-800">{{ metricas.total }}</p>
          </div>
          <div class="p-3 rounded-full bg-gray-50">
            <i class="pi pi-list-check text-2xl" style="color:#0f2557"></i>
          </div>
        </div>
      </div>
      <!-- En proceso -->
      <div class="bg-white rounded-xl p-6 shadow-sm border-l-4" style="border-left-color:#f59e0b">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 mb-1">En proceso</p>
            <p class="text-3xl font-bold text-gray-800">{{ metricas.pendientes }}</p>
          </div>
          <div class="p-3 rounded-full bg-gray-50">
            <i class="pi pi-clock text-2xl" style="color:#f59e0b"></i>
          </div>
        </div>
      </div>
      <!-- Resueltos -->
      <div class="bg-white rounded-xl p-6 shadow-sm border-l-4" style="border-left-color:#10b981">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 mb-1">Resueltos</p>
            <p class="text-3xl font-bold text-gray-800">{{ metricas.resueltos }}</p>
          </div>
          <div class="p-3 rounded-full bg-gray-50">
            <i class="pi pi-check-circle text-2xl" style="color:#10b981"></i>
          </div>
        </div>
      </div>
      <!-- Alta prioridad -->
      <div class="bg-white rounded-xl p-6 shadow-sm border-l-4" style="border-left-color:#ef4444">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 mb-1">Alta prioridad</p>
            <p class="text-3xl font-bold text-gray-800">{{ metricas.alta_prioridad }}</p>
          </div>
          <div class="p-3 rounded-full bg-gray-50">
            <i class="pi pi-exclamation-triangle text-2xl" style="color:#ef4444"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Barra de filtros -->
    <div class="flex flex-wrap items-center gap-3 p-4 mb-5 bg-white rounded-xl shadow-sm border border-gray-100">
      <Select
        v-model="filtroEstado"
        :options="opcionesEstado"
        option-label="label"
        option-value="value"
        placeholder="Estado"
        show-clear
        class="w-44"
        @change="aplicarFiltros"
      />
      <Select
        v-model="filtroTipo"
        :options="opcionesTipo"
        option-label="label"
        option-value="value"
        placeholder="Tipo"
        show-clear
        class="w-44"
        @change="aplicarFiltros"
      />
      <Select
        v-model="filtroPrioridad"
        :options="opcionesPrioridad"
        option-label="label"
        option-value="value"
        placeholder="Prioridad"
        show-clear
        class="w-40"
        @change="aplicarFiltros"
      />
      <Button
        label="Limpiar filtros"
        icon="pi pi-filter-slash"
        text
        severity="secondary"
        size="small"
        :disabled="!filtroEstado && !filtroTipo && !filtroPrioridad"
        @click="limpiarFiltros"
      />
    </div>

    <!-- Error -->
    <Message v-if="req.error" severity="error" :closable="false" class="mb-4">
      {{ req.error }}
    </Message>

    <!-- Loading -->
    <div v-if="req.loading" class="flex flex-col items-center justify-center py-24 gap-3">
      <ProgressSpinner style="width:50px;height:50px" strokeWidth="4" />
      <span class="text-sm text-slate-400">Cargando requerimientos…</span>
    </div>

    <!-- Tabla -->
    <div v-else>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-700">Lista de requerimientos</h2>
        <span class="text-sm text-gray-500">{{ req.requerimientos.length }} resultados</span>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <DataTable
        :value="req.requerimientos"
        :rows="15"
        :paginator="req.requerimientos.length > 15"
        paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
        :row-class="() => 'cursor-pointer hover:bg-blue-50 transition-colors'"
        @row-click="navegarDetalle"
      >
        <template #empty>
          <div class="flex flex-col items-center justify-center py-20 text-center">
            <div class="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <i class="pi pi-inbox text-4xl" style="color:#93c5fd"></i>
            </div>
            <h3 class="text-lg font-semibold text-gray-600 mb-2">
              {{ filtroEstado || filtroTipo || filtroPrioridad
                ? 'Sin resultados para los filtros aplicados'
                : 'No hay requerimientos aún' }}
            </h3>
            <p class="text-gray-400 text-sm mb-6 max-w-sm">
              {{ filtroEstado || filtroTipo || filtroPrioridad
                ? 'Prueba cambiando o limpiando los filtros'
                : 'Crea el primer requerimiento del proyecto para empezar a hacer seguimiento' }}
            </p>
            <Button
              v-if="!filtroEstado && !filtroTipo && !filtroPrioridad"
              label="Crear primer requerimiento"
              icon="pi pi-plus"
              size="small"
              style="background:linear-gradient(135deg,#1e3a8a,#3b82f6);border:none"
              @click.stop="router.push('/requerimientos/nuevo')"
            />
          </div>
        </template>

        <Column field="id" header="#" style="width:4rem;color:#64748b;font-size:0.8rem" />

        <Column field="titulo" header="Título">
          <template #body="{ data }">
            <span class="font-medium text-slate-800">{{ data.titulo }}</span>
          </template>
        </Column>

        <Column field="tipo" header="Tipo" style="width:9rem">
          <template #body="{ data }">
            <span class="text-sm text-slate-600">{{ tipoLabel(data.tipo) }}</span>
          </template>
        </Column>

        <Column field="prioridad" header="Prioridad" style="width:8rem">
          <template #body="{ data }">
            <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :style="prioridadStyle(data.prioridad)">
              {{ prioridadLabel(data.prioridad) }}
            </span>
          </template>
        </Column>

        <Column field="estado" header="Estado" style="width:10rem">
          <template #body="{ data }">
            <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :style="estadoStyle(data.estado)">
              {{ estadoLabel(data.estado) }}
            </span>
          </template>
        </Column>

        <Column field="creado_en" header="Fecha" style="width:9rem">
          <template #body="{ data }">
            <span class="text-sm text-slate-500">{{ formatFecha(data.creado_en) }}</span>
          </template>
        </Column>

        <Column header="Acciones" style="width:7rem">
          <template #body="{ data }">
            <div class="flex gap-1" @click.stop>
              <Button
                title="Ver detalle"
                icon="pi pi-eye"
                text rounded size="small"
                @click="router.push(`/requerimientos/${data.id}`)"
              />
              <Button
                v-if="auth.isAdmin || auth.isSuperAdmin"
                title="Archivar requerimiento"
                icon="pi pi-inbox"
                text rounded size="small"
                severity="warn"
                @click="confirmarArchivar(data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
      </div>
    </div>
  </AppLayout>
</template>
