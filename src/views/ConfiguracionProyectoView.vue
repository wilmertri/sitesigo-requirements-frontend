<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useConfigStore } from '../stores/config'
import { useThemeStore } from '../stores/theme'
import { useToast } from 'primevue/usetoast'
import api from '../services/api'
import AppLayout from '../components/AppLayout.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import Checkbox from 'primevue/checkbox'
import Message from 'primevue/message'
import Toast from 'primevue/toast'
import ProgressSpinner from 'primevue/progressspinner'

const route       = useRoute()
const router      = useRouter()
const configStore = useConfigStore()
const themeStore  = useThemeStore()
const toast       = useToast()

const proyectoId = computed(() => Number(route.params.id))
const proyecto   = ref(null)
const campos     = ref([])
const estados    = ref([])
const loading    = ref(true)

// ── Campo ─────────────────────────────────────────────────────────────────────
const dialogCampo  = ref(false)
const nuevoCampo   = ref({})
const errorCampo   = ref('')
const creandoCampo = ref(false)
const opcionInput  = ref('')

const tiposDisponibles = [
    { label: 'Texto',             value: 'texto' },
    { label: 'Número',            value: 'numero' },
    { label: 'Lista de opciones', value: 'lista' },
    { label: 'Fecha',             value: 'fecha' },
    { label: 'Calculado',         value: 'calculado' },
]

function abrirDialogCampo() {
    nuevoCampo.value = { nombre: '', clave: '', tipo: null, obligatorio: false, opciones: [], _claveEditada: false }
    errorCampo.value = ''
    opcionInput.value = ''
    dialogCampo.value = true
}

function generarClave(nombre) {
    return nombre
        .toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
}

function onNombreInput() {
    if (!nuevoCampo.value._claveEditada) {
        nuevoCampo.value.clave = generarClave(nuevoCampo.value.nombre)
    }
}

function agregarOpcion() {
    const o = opcionInput.value.trim()
    if (!o || nuevoCampo.value.opciones.includes(o)) return
    nuevoCampo.value.opciones.push(o)
    opcionInput.value = ''
}

function quitarOpcion(i) {
    nuevoCampo.value.opciones.splice(i, 1)
}

async function crearCampo() {
    errorCampo.value = ''
    const c = nuevoCampo.value
    if (!c.nombre.trim()) { errorCampo.value = 'El nombre es obligatorio'; return }
    if (!c.clave.trim())  { errorCampo.value = 'La clave es obligatoria'; return }
    if (!c.tipo)          { errorCampo.value = 'Selecciona un tipo'; return }
    if (c.tipo === 'lista' && !c.opciones.length) {
        errorCampo.value = 'Agrega al menos una opción para el campo de lista'
        return
    }
    creandoCampo.value = true
    try {
        const r = await api.post(`/proyectos/${proyectoId.value}/campos`, {
            nombre:      c.nombre.trim(),
            clave:       c.clave.trim(),
            tipo:        c.tipo,
            obligatorio: c.obligatorio,
            opciones:    c.tipo === 'lista' ? c.opciones : [],
        })
        campos.value.push(r.data)
        configStore.invalidar(proyectoId.value)
        dialogCampo.value = false
        toast.add({ severity: 'success', summary: 'Campo creado', detail: c.nombre.trim(), life: 3000 })
    } catch (e) {
        const d = e.response?.data?.detail
        errorCampo.value = typeof d === 'string' ? d : 'Error al crear el campo'
    } finally {
        creandoCampo.value = false
    }
}

// ── Estado ────────────────────────────────────────────────────────────────────
const dialogEstado  = ref(false)
const nuevoEstado   = ref({})
const errorEstado   = ref('')
const creandoEstado = ref(false)

function abrirDialogEstado() {
    nuevoEstado.value = { nombre: '', color: '#3b82f6', orden: estados.value.length + 1, es_terminal: false }
    errorEstado.value = ''
    dialogEstado.value = true
}

async function crearEstado() {
    errorEstado.value = ''
    const e = nuevoEstado.value
    if (!e.nombre.trim()) { errorEstado.value = 'El nombre es obligatorio'; return }
    creandoEstado.value = true
    try {
        const r = await api.post(`/proyectos/${proyectoId.value}/estados`, {
            nombre:      e.nombre.trim(),
            color:       e.color,
            orden:       e.orden,
            es_terminal: e.es_terminal,
        })
        estados.value.push(r.data)
        configStore.invalidar(proyectoId.value)
        dialogEstado.value = false
        toast.add({ severity: 'success', summary: 'Estado creado', detail: e.nombre.trim(), life: 3000 })
    } catch (err) {
        const d = err.response?.data?.detail
        errorEstado.value = typeof d === 'string' ? d : 'Error al crear el estado'
    } finally {
        creandoEstado.value = false
    }
}

// ── Helpers visuales ──────────────────────────────────────────────────────────
function tipoLabel(tipo) {
    return tiposDisponibles.find(t => t.value === tipo)?.label ?? tipo
}

function tipoBadge(tipo) {
    if (themeStore.isDark) {
        const map = {
            texto:     'background:#1e3a5f;color:#93c5fd',
            numero:    'background:#431407;color:#fdba74',
            lista:     'background:#2e1065;color:#c4b5fd',
            fecha:     'background:#14532d;color:#86efac',
            calculado: 'background:#422006;color:#fde68a',
        }
        return map[tipo] ?? 'background:#1e293b;color:#94a3b8'
    }
    const map = {
        texto:     'background:#dbeafe;color:#1d4ed8',
        numero:    'background:#ffedd5;color:#c2410c',
        lista:     'background:#ede9fe;color:#7c3aed',
        fecha:     'background:#dcfce7;color:#15803d',
        calculado: 'background:#fef9c3;color:#a16207',
    }
    return map[tipo] ?? 'background:#f3f4f6;color:#6b7280'
}

// ── Carga inicial ─────────────────────────────────────────────────────────────
onMounted(async () => {
    try {
        const [p, c, e] = await Promise.all([
            api.get(`/proyectos/${proyectoId.value}`),
            api.get(`/proyectos/${proyectoId.value}/campos`),
            api.get(`/proyectos/${proyectoId.value}/estados`),
        ])
        proyecto.value = p.data
        campos.value   = c.data
        estados.value  = e.data
    } finally {
        loading.value = false
    }
})
</script>

<template>
  <AppLayout>
    <Toast position="top-right" />

    <Button
      icon="pi pi-arrow-left"
      text rounded size="small" severity="secondary"
      class="mb-6"
      @click="router.push('/proyectos')"
    />

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-24 gap-3">
      <ProgressSpinner style="width:50px;height:50px" strokeWidth="4" />
      <span class="text-sm text-slate-400">Cargando configuración…</span>
    </div>

    <template v-else>
      <!-- Encabezado -->
      <div class="mb-6">
        <h1 :class="themeStore.isDark ? 'text-white' : 'text-slate-800'" class="text-2xl font-bold">
          Configuración del Proyecto
        </h1>
        <p :class="themeStore.isDark ? 'text-slate-400' : 'text-slate-500'" class="text-sm mt-0.5">
          {{ proyecto?.nombre }} — campos y estados configurables
        </p>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">

        <!-- ── CAMPOS ───────────────────────────────────────────────── -->
        <div
          class="rounded-xl shadow-sm border overflow-hidden"
          :class="themeStore.isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between px-5 py-4 border-b"
            :class="themeStore.isDark ? 'border-slate-700' : 'border-gray-100'"
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style="background:#0f2557">
                <i class="pi pi-list text-white text-sm"></i>
              </div>
              <div>
                <h2 class="font-semibold text-sm" :class="themeStore.isDark ? 'text-white' : 'text-gray-800'">
                  Campos configurables
                </h2>
                <p class="text-xs" :class="themeStore.isDark ? 'text-slate-400' : 'text-gray-500'">
                  {{ campos.length }} campo{{ campos.length !== 1 ? 's' : '' }}
                </p>
              </div>
            </div>
            <Button label="Nuevo campo" icon="pi pi-plus" size="small" @click="abrirDialogCampo" />
          </div>

          <DataTable :value="campos">
            <template #empty>
              <div class="flex flex-col items-center py-10 gap-2">
                <i class="pi pi-list text-4xl" :class="themeStore.isDark ? 'text-slate-600' : 'text-slate-300'"></i>
                <p class="text-sm" :class="themeStore.isDark ? 'text-slate-400' : 'text-slate-500'">
                  Sin campos configurados
                </p>
                <Button label="Agregar primer campo" icon="pi pi-plus" size="small" text @click="abrirDialogCampo" />
              </div>
            </template>

            <Column field="nombre" header="Nombre">
              <template #body="{ data }">
                <p class="font-medium text-sm" :class="themeStore.isDark ? 'text-white' : 'text-slate-800'">
                  {{ data.nombre }}
                </p>
                <p class="text-xs font-mono" :class="themeStore.isDark ? 'text-slate-500' : 'text-slate-400'">
                  {{ data.clave }}
                </p>
              </template>
            </Column>

            <Column field="tipo" header="Tipo" style="width:10rem">
              <template #body="{ data }">
                <span class="px-2 py-0.5 rounded text-xs font-semibold" :style="tipoBadge(data.tipo)">
                  {{ tipoLabel(data.tipo) }}
                </span>
              </template>
            </Column>

            <Column field="obligatorio" header="Req." style="width:4rem;text-align:center">
              <template #body="{ data }">
                <i :class="data.obligatorio ? 'pi pi-check text-green-500' : 'pi pi-minus text-slate-300'" />
              </template>
            </Column>
          </DataTable>
        </div>

        <!-- ── ESTADOS ──────────────────────────────────────────────── -->
        <div
          class="rounded-xl shadow-sm border overflow-hidden"
          :class="themeStore.isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between px-5 py-4 border-b"
            :class="themeStore.isDark ? 'border-slate-700' : 'border-gray-100'"
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style="background:#7c3aed">
                <i class="pi pi-tag text-white text-sm"></i>
              </div>
              <div>
                <h2 class="font-semibold text-sm" :class="themeStore.isDark ? 'text-white' : 'text-gray-800'">
                  Estados del proyecto
                </h2>
                <p class="text-xs" :class="themeStore.isDark ? 'text-slate-400' : 'text-gray-500'">
                  {{ estados.length }} estado{{ estados.length !== 1 ? 's' : '' }}
                </p>
              </div>
            </div>
            <Button
              label="Nuevo estado"
              icon="pi pi-plus"
              size="small"
              style="background:#7c3aed;border-color:#7c3aed"
              @click="abrirDialogEstado"
            />
          </div>

          <DataTable :value="estados">
            <template #empty>
              <div class="flex flex-col items-center py-10 gap-2">
                <i class="pi pi-tag text-4xl" :class="themeStore.isDark ? 'text-slate-600' : 'text-slate-300'"></i>
                <p class="text-sm" :class="themeStore.isDark ? 'text-slate-400' : 'text-slate-500'">
                  Sin estados configurados
                </p>
                <Button label="Agregar primer estado" icon="pi pi-plus" size="small" text @click="abrirDialogEstado" />
              </div>
            </template>

            <Column field="nombre" header="Nombre">
              <template #body="{ data }">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full shrink-0" :style="`background:${data.color ?? '#94a3b8'}`"></div>
                  <span class="font-medium text-sm" :class="themeStore.isDark ? 'text-white' : 'text-slate-800'">
                    {{ data.nombre }}
                  </span>
                </div>
              </template>
            </Column>

            <Column field="orden" header="Orden" style="width:5rem">
              <template #body="{ data }">
                <span class="text-sm" :class="themeStore.isDark ? 'text-slate-300' : 'text-slate-600'">
                  {{ data.orden }}
                </span>
              </template>
            </Column>

            <Column field="es_terminal" header="Terminal" style="width:6rem;text-align:center">
              <template #body="{ data }">
                <i :class="data.es_terminal ? 'pi pi-check-circle text-green-500' : 'pi pi-minus text-slate-300'" />
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </template>

    <!-- ── Dialog Nuevo Campo ─────────────────────────────────────── -->
    <Dialog v-model:visible="dialogCampo" :style="{ width: '500px' }" :modal="true" :draggable="false">
      <template #header>
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style="background:#0f2557">
            <i class="pi pi-list text-white text-sm"></i>
          </div>
          <span class="text-lg font-semibold" :class="themeStore.isDark ? 'text-white' : 'text-gray-800'">
            Nuevo Campo
          </span>
        </div>
      </template>

      <div class="flex flex-col gap-5 p-6">
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium" :class="themeStore.isDark ? 'text-slate-300' : 'text-slate-700'">
            Nombre <span class="text-red-500">*</span>
          </label>
          <InputText
            v-model="nuevoCampo.nombre"
            placeholder="Ej: Fecha de solicitud"
            fluid
            @input="onNombreInput"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium" :class="themeStore.isDark ? 'text-slate-300' : 'text-slate-700'">
            Clave <span class="text-red-500">*</span>
          </label>
          <InputText
            v-model="nuevoCampo.clave"
            placeholder="fecha_solicitud"
            class="font-mono"
            fluid
            @input="nuevoCampo._claveEditada = true"
          />
          <small class="text-xs" :class="themeStore.isDark ? 'text-slate-500' : 'text-gray-400'">
            Identificador único. Solo letras minúsculas, números y guión bajo.
          </small>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium" :class="themeStore.isDark ? 'text-slate-300' : 'text-slate-700'">
              Tipo <span class="text-red-500">*</span>
            </label>
            <Select
              v-model="nuevoCampo.tipo"
              :options="tiposDisponibles"
              option-label="label"
              option-value="value"
              placeholder="Seleccionar"
              fluid
            />
          </div>

          <div class="flex items-center gap-2 pt-6">
            <Checkbox v-model="nuevoCampo.obligatorio" :binary="true" inputId="chkObligatorio" />
            <label
              for="chkObligatorio"
              class="text-sm select-none cursor-pointer"
              :class="themeStore.isDark ? 'text-slate-300' : 'text-slate-700'"
            >
              Obligatorio
            </label>
          </div>
        </div>

        <!-- Opciones (solo tipo lista) -->
        <div
          v-if="nuevoCampo.tipo === 'lista'"
          class="flex flex-col gap-3 p-4 rounded-lg border"
          :class="themeStore.isDark ? 'bg-slate-900 border-slate-600' : 'bg-slate-50 border-slate-200'"
        >
          <label class="text-sm font-medium" :class="themeStore.isDark ? 'text-slate-300' : 'text-slate-700'">
            Opciones <span class="text-red-500">*</span>
          </label>
          <div class="flex gap-2">
            <InputText
              v-model="opcionInput"
              placeholder="Nueva opción…"
              fluid
              @keyup.enter="agregarOpcion"
            />
            <Button icon="pi pi-plus" @click="agregarOpcion" />
          </div>
          <div class="flex flex-wrap gap-2 min-h-[28px]">
            <span
              v-for="(op, i) in nuevoCampo.opciones"
              :key="i"
              class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
              :class="themeStore.isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-50 text-blue-700'"
            >
              {{ op }}
              <button type="button" @click="quitarOpcion(i)" class="opacity-60 hover:opacity-100 leading-none">
                <i class="pi pi-times text-xs"></i>
              </button>
            </span>
            <span
              v-if="!nuevoCampo.opciones?.length"
              class="text-xs italic"
              :class="themeStore.isDark ? 'text-slate-500' : 'text-slate-400'"
            >
              Sin opciones aún
            </span>
          </div>
        </div>

        <Message v-if="errorCampo" severity="error" :closable="false">{{ errorCampo }}</Message>
      </div>

      <template #footer>
        <div class="flex gap-2 justify-end">
          <Button
            label="Cancelar" icon="pi pi-times"
            severity="secondary" outlined
            :disabled="creandoCampo"
            @click="dialogCampo = false"
          />
          <Button label="Crear campo" icon="pi pi-check" :loading="creandoCampo" @click="crearCampo" />
        </div>
      </template>
    </Dialog>

    <!-- ── Dialog Nuevo Estado ───────────────────────────────────── -->
    <Dialog v-model:visible="dialogEstado" :style="{ width: '440px' }" :modal="true" :draggable="false">
      <template #header>
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style="background:#7c3aed">
            <i class="pi pi-tag text-white text-sm"></i>
          </div>
          <span class="text-lg font-semibold" :class="themeStore.isDark ? 'text-white' : 'text-gray-800'">
            Nuevo Estado
          </span>
        </div>
      </template>

      <div class="flex flex-col gap-5 p-6">
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium" :class="themeStore.isDark ? 'text-slate-300' : 'text-slate-700'">
            Nombre <span class="text-red-500">*</span>
          </label>
          <InputText
            v-model="nuevoEstado.nombre"
            placeholder="Ej: En revisión"
            fluid
            @keyup.enter="crearEstado"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium" :class="themeStore.isDark ? 'text-slate-300' : 'text-slate-700'">
              Color
            </label>
            <div class="flex items-center gap-3">
              <input
                type="color"
                v-model="nuevoEstado.color"
                class="w-10 h-10 rounded cursor-pointer border-0 p-0.5"
              />
              <span class="text-sm font-mono" :class="themeStore.isDark ? 'text-slate-300' : 'text-slate-600'">
                {{ nuevoEstado.color }}
              </span>
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium" :class="themeStore.isDark ? 'text-slate-300' : 'text-slate-700'">
              Orden
            </label>
            <InputNumber v-model="nuevoEstado.orden" :min="1" :use-grouping="false" fluid />
          </div>
        </div>

        <div class="flex items-center gap-2">
          <Checkbox v-model="nuevoEstado.es_terminal" :binary="true" inputId="chkTerminal" />
          <label
            for="chkTerminal"
            class="text-sm select-none cursor-pointer"
            :class="themeStore.isDark ? 'text-slate-300' : 'text-slate-700'"
          >
            Estado terminal (cierra el requerimiento)
          </label>
        </div>

        <!-- Preview badge -->
        <div
          v-if="nuevoEstado.nombre"
          class="flex items-center gap-3 p-3 rounded-lg"
          :class="themeStore.isDark ? 'bg-slate-900' : 'bg-slate-50'"
        >
          <span class="text-xs font-medium" :class="themeStore.isDark ? 'text-slate-400' : 'text-slate-500'">
            Vista previa:
          </span>
          <div class="flex items-center gap-1.5">
            <div class="w-2.5 h-2.5 rounded-full" :style="`background:${nuevoEstado.color}`"></div>
            <span
              class="px-2.5 py-0.5 rounded-full text-xs font-semibold"
              :style="`background:${nuevoEstado.color}22;color:${nuevoEstado.color}`"
            >
              {{ nuevoEstado.nombre }}
            </span>
          </div>
        </div>

        <Message v-if="errorEstado" severity="error" :closable="false">{{ errorEstado }}</Message>
      </div>

      <template #footer>
        <div class="flex gap-2 justify-end">
          <Button
            label="Cancelar" icon="pi pi-times"
            severity="secondary" outlined
            :disabled="creandoEstado"
            @click="dialogEstado = false"
          />
          <Button
            label="Crear estado" icon="pi pi-check"
            :loading="creandoEstado"
            style="background:#7c3aed;border-color:#7c3aed"
            @click="crearEstado"
          />
        </div>
      </template>
    </Dialog>

  </AppLayout>
</template>
