<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import api from '../services/api'
import AppLayout from '../components/AppLayout.vue'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Toast from 'primevue/toast'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'

const router  = useRouter()
const toast   = useToast()

// ── Formulario ─────────────────────────────────────────────────────────────
const titulo      = ref('')
const descripcion = ref('')
const tipo        = ref(null)
const prioridad   = ref(null)
const loading     = ref(false)
const errorMsg    = ref('')
const errors      = ref({})

const opcionesTipo = [
    { label: 'Bug',                    value: 'Bug' },
    { label: 'Nueva funcionalidad',    value: 'Nueva funcionalidad' },
    { label: 'Cambio en modulo',       value: 'Cambio en modulo' },
    { label: 'Mejora UX/rendimiento',  value: 'Mejora UX/rendimiento' },
]

const opcionesPrioridad = [
    { label: 'Alta',  value: 'Alta' },
    { label: 'Media', value: 'Media' },
    { label: 'Baja',  value: 'Baja' },
]

function validate() {
    const e = {}
    if (!titulo.value.trim())      e.titulo      = 'El título es obligatorio'
    if (!descripcion.value.trim()) e.descripcion = 'La descripción es obligatoria'
    if (!tipo.value)               e.tipo        = 'Selecciona un tipo'
    if (!prioridad.value)          e.prioridad   = 'Selecciona una prioridad'
    errors.value = e
    return Object.keys(e).length === 0
}

async function crear() {
    errorMsg.value = ''
    if (!validate()) return

    loading.value = true
    try {
        await api.post('/requerimientos/', {
            titulo:      titulo.value.trim(),
            descripcion: descripcion.value.trim(),
            tipo:        tipo.value,
            prioridad:   prioridad.value,
        })
        toast.add({ severity: 'success', summary: 'Creado', detail: 'Requerimiento creado correctamente', life: 2500 })
        setTimeout(() => router.push('/dashboard'), 800)
    } catch (err) {
        const status = err.response?.status
        const detail = err.response?.data?.detail
        if (status === 422) {
            errorMsg.value = typeof detail === 'string'
                ? detail
                : 'Datos inválidos — revisa los campos e intenta de nuevo.'
        } else {
            errorMsg.value = 'Error al crear el requerimiento. Intenta de nuevo.'
        }
    } finally {
        loading.value = false
    }
}
</script>

<template>
  <AppLayout>
    <Toast position="top-right" />

    <!-- Encabezado de página -->
    <div class="flex items-center gap-3 mb-6">
      <Button
        icon="pi pi-arrow-left"
        text
        rounded
        size="small"
        severity="secondary"
        @click="router.push('/dashboard')"
      />
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Nuevo Requerimiento</h1>
        <p class="text-sm text-slate-500 mt-0.5">Completa los campos para registrar el requerimiento</p>
      </div>
    </div>

    <!-- Formulario centrado -->
    <div class="max-w-2xl">
      <Card class="shadow-sm">
        <template #content>
          <form @submit.prevent="crear" class="flex flex-col gap-5">

            <!-- Título -->
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-700">
                Título <span class="text-red-500">*</span>
              </label>
              <IconField>
                <InputIcon class="pi pi-tag" />
                <InputText
                  v-model="titulo"
                  placeholder="Describe brevemente el requerimiento"
                  fluid
                  :invalid="!!errors.titulo"
                  maxlength="200"
                />
              </IconField>
              <small v-if="errors.titulo" class="text-red-500 text-xs">{{ errors.titulo }}</small>
            </div>

            <!-- Descripción -->
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-700">
                Descripción <span class="text-red-500">*</span>
              </label>
              <Textarea
                v-model="descripcion"
                placeholder="Explica con detalle el requerimiento, contexto e impacto esperado…"
                :rows="5"
                fluid
                :invalid="!!errors.descripcion"
                :auto-resize="false"
              />
              <small v-if="errors.descripcion" class="text-red-500 text-xs">{{ errors.descripcion }}</small>
            </div>

            <!-- Tipo + Prioridad -->
            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium text-slate-700">
                  Tipo <span class="text-red-500">*</span>
                </label>
                <Select
                  v-model="tipo"
                  :options="opcionesTipo"
                  option-label="label"
                  option-value="value"
                  placeholder="Seleccionar tipo"
                  fluid
                  :invalid="!!errors.tipo"
                />
                <small v-if="errors.tipo" class="text-red-500 text-xs">{{ errors.tipo }}</small>
              </div>

              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium text-slate-700">
                  Prioridad <span class="text-red-500">*</span>
                </label>
                <Select
                  v-model="prioridad"
                  :options="opcionesPrioridad"
                  option-label="label"
                  option-value="value"
                  placeholder="Seleccionar prioridad"
                  fluid
                  :invalid="!!errors.prioridad"
                />
                <small v-if="errors.prioridad" class="text-red-500 text-xs">{{ errors.prioridad }}</small>
              </div>
            </div>

            <!-- Error del servidor -->
            <Message v-if="errorMsg" severity="error" :closable="false">
              {{ errorMsg }}
            </Message>

            <!-- Acciones -->
            <div class="flex gap-3 pt-2">
              <Button
                label="Crear Requerimiento"
                icon="pi pi-check"
                type="submit"
                :loading="loading"
                class="flex-1"
              />
              <Button
                label="Cancelar"
                icon="pi pi-times"
                severity="secondary"
                outlined
                :disabled="loading"
                @click="router.push('/dashboard')"
              />
            </div>
          </form>
        </template>
      </Card>
    </div>
  </AppLayout>
</template>
