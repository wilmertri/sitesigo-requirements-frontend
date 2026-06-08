<script setup>
import { ref, onMounted } from 'vue'
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

onMounted(() => req.cargarRequerimientos({}))
</script>

<template>
  <AppLayout>
    <Toast position="top-right" />
    <ConfirmDialog />

    <!-- Título + botón nuevo -->
    <div class="flex items-start justify-between mb-5">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Requerimientos</h1>
        <p class="text-sm text-slate-500 mt-0.5">
          <template v-if="!req.loading">
            {{ req.requerimientos.length }}
            requerimiento{{ req.requerimientos.length !== 1 ? 's' : '' }}
          </template>
        </p>
      </div>
      <Button
        label="Nuevo Requerimiento"
        icon="pi pi-plus"
        @click="router.push('/requerimientos/nuevo')"
      />
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
    <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <DataTable
        :value="req.requerimientos"
        :rows="15"
        :paginator="req.requerimientos.length > 15"
        paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
        :row-class="() => 'cursor-pointer hover:bg-blue-50 transition-colors'"
        @row-click="navegarDetalle"
      >
        <template #empty>
          <div class="flex flex-col items-center py-16 text-slate-400">
            <i class="pi pi-inbox text-6xl mb-4 text-slate-300"></i>
            <p class="text-base font-medium text-slate-500">No hay requerimientos</p>
            <p class="text-sm mt-1">
              {{ filtroEstado || filtroTipo || filtroPrioridad
                ? 'Prueba cambiando los filtros'
                : 'Crea el primero con el botón "Nuevo Requerimiento"' }}
            </p>
            <Button
              v-if="!filtroEstado && !filtroTipo && !filtroPrioridad"
              label="Nuevo Requerimiento"
              icon="pi pi-plus"
              size="small"
              class="mt-4"
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
                title="Archivar"
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
  </AppLayout>
</template>
