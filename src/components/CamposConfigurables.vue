<script setup>
import { ref, watch, onMounted } from 'vue'
import { useConfigStore } from '../stores/config'
import { useThemeStore } from '../stores/theme'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import ProgressSpinner from 'primevue/progressspinner'

const props = defineProps({
    proyectoId: { type: [Number, String], required: true },
    modelValue: { type: Object,  default: () => ({}) },
    readonly:   { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const configStore = useConfigStore()
const themeStore  = useThemeStore()

const campos      = ref([])
const loading     = ref(true)
const diasHabiles = ref(null)
const calculando  = ref(false)

// ── Carga inicial ─────────────────────────────────────────────────────────────
onMounted(async () => {
    try {
        campos.value = await configStore.fetchCampos(props.proyectoId)
        await recalcular()
    } finally {
        loading.value = false
    }
})

// ── Días hábiles — recalcular cuando cambian las fechas ───────────────────────
watch(
    () => [props.modelValue?.fecha_inicio, props.modelValue?.fecha_final],
    () => recalcular()
)

async function recalcular() {
    const hayCalculado = campos.value.some(c => c.tipo === 'calculado')
    const inicio       = props.modelValue?.fecha_inicio
    const final        = props.modelValue?.fecha_final

    if (!hayCalculado || !inicio || !final) {
        diasHabiles.value = null
        return
    }
    calculando.value = true
    try {
        const res     = await configStore.calcularDiasHabiles(props.proyectoId, inicio, final)
        diasHabiles.value = res?.dias_habiles ?? res
    } catch {
        diasHabiles.value = null
    } finally {
        calculando.value = false
    }
}

// ── Helpers v-model ───────────────────────────────────────────────────────────
function get(clave)        { return props.modelValue?.[clave] ?? null }
function set(clave, valor) { emit('update:modelValue', { ...props.modelValue, [clave]: valor }) }

// ── Opciones de lista ─────────────────────────────────────────────────────────
function opcionesSelect(campo) {
    return (campo.opciones ?? []).map(o => ({ label: o, value: o }))
}

// ── Formato fecha para modo readonly ─────────────────────────────────────────
function formatFecha(v) {
    if (!v) return null
    const [y, m, d] = v.split('-')
    return `${d}/${m}/${y}`
}

// ── Estilos del input fecha nativo (imita PrimeVue) ──────────────────────────
const inputFechaStyle = () =>
    themeStore.isDark
        ? 'background:#0f172a;color:#e2e8f0;border-color:#334155'
        : 'background:#ffffff;color:#374151;border-color:#d1d5db'
</script>

<template>
  <!-- Loading -->
  <div v-if="loading" class="flex justify-center py-6">
    <ProgressSpinner style="width:28px;height:28px" strokeWidth="4" />
  </div>

  <!-- Sin campos configurados -->
  <div v-else-if="!campos.length" />

  <!-- Campos -->
  <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
    <div
      v-for="campo in campos"
      :key="campo.clave"
      class="flex flex-col gap-1.5"
      :class="campo.tipo === 'texto' ? 'sm:col-span-2 md:col-span-4' : ''"
    >

      <!-- Label -->
      <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {{ campo.nombre }}
        <span v-if="campo.obligatorio" class="text-red-500">*</span>
      </label>

      <!-- TEXTO -->
      <template v-if="campo.tipo === 'texto'">
        <InputText
          v-if="!readonly"
          :value="get(campo.clave) ?? ''"
          @input="set(campo.clave, $event.target.value)"
          fluid
        />
        <p v-else :class="themeStore.isDark ? 'text-slate-300' : 'text-gray-700'" class="text-sm">
          {{ get(campo.clave) || '—' }}
        </p>
      </template>

      <!-- NUMERO -->
      <template v-else-if="campo.tipo === 'numero'">
        <InputNumber
          v-if="!readonly"
          :model-value="get(campo.clave)"
          @update:model-value="set(campo.clave, $event)"
          :use-grouping="false"
          fluid
        />
        <p v-else :class="themeStore.isDark ? 'text-slate-300' : 'text-gray-700'" class="text-sm">
          {{ get(campo.clave) ?? '—' }}
        </p>
      </template>

      <!-- LISTA -->
      <template v-else-if="campo.tipo === 'lista'">
        <Select
          v-if="!readonly"
          :model-value="get(campo.clave)"
          :options="opcionesSelect(campo)"
          option-label="label"
          option-value="value"
          show-clear
          fluid
          @update:model-value="set(campo.clave, $event)"
        />
        <p v-else :class="themeStore.isDark ? 'text-slate-300' : 'text-gray-700'" class="text-sm">
          {{ get(campo.clave) || '—' }}
        </p>
      </template>

      <!-- FECHA -->
      <template v-else-if="campo.tipo === 'fecha'">
        <input
          v-if="!readonly"
          type="date"
          :value="get(campo.clave) ?? ''"
          @change="set(campo.clave, $event.target.value)"
          class="w-full px-3 py-2 rounded-lg border text-sm transition-colors
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
          :style="inputFechaStyle()"
        />
        <p v-else :class="themeStore.isDark ? 'text-slate-300' : 'text-gray-700'" class="text-sm">
          {{ formatFecha(get(campo.clave)) || '—' }}
        </p>
      </template>

      <!-- CALCULADO (días hábiles) -->
      <template v-else-if="campo.tipo === 'calculado'">
        <div class="flex items-center gap-2 h-9">
          <span v-if="calculando" class="text-sm text-gray-400 italic">Calculando…</span>
          <span
            v-else-if="diasHabiles !== null"
            :class="themeStore.isDark ? 'text-slate-200' : 'text-gray-800'"
            class="text-sm font-semibold"
          >
            {{ diasHabiles }} día{{ diasHabiles !== 1 ? 's' : '' }}
          </span>
          <span v-else class="text-sm text-gray-400 italic">
            Requiere fecha inicio y fecha final
          </span>
        </div>
      </template>

    </div>
  </div>
</template>
