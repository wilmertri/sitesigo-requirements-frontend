<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import api from '../services/api'
import AppLayout from '../components/AppLayout.vue'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Toast from 'primevue/toast'

const router  = useRouter()
const toast   = useToast()

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
        await api.post('/requerimientos', {
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

    <Button
      icon="pi pi-arrow-left"
      text rounded size="small" severity="secondary"
      class="mb-6"
      @click="router.push('/dashboard')"
    />

    <div class="max-w-2xl mx-auto">
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden">

        <!-- Card header -->
        <div
          class="px-8 py-6 border-b border-gray-100"
          style="background:linear-gradient(135deg,#f8fafc,#f0f4ff)"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style="background:#0f2557"
            >
              <i class="pi pi-file-plus text-white text-xl"></i>
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-800">Nuevo Requerimiento</h1>
              <p class="text-sm text-gray-500 mt-0.5">Completa los campos para registrar el requerimiento</p>
            </div>
          </div>
        </div>

        <!-- Form body -->
        <form @submit.prevent="crear" class="p-8">

          <!-- Sección 1: Información básica -->
          <div class="mb-8">
            <div class="flex items-center gap-2 mb-5">
              <div class="w-1 h-5 rounded-full" style="background:#0f2557"></div>
              <h2 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Información básica</h2>
            </div>

            <div class="flex flex-col gap-5">
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Título <span class="text-red-500">*</span>
                </label>
                <InputText
                  v-model="titulo"
                  placeholder="Describe brevemente el requerimiento"
                  fluid
                  :invalid="!!errors.titulo"
                  maxlength="200"
                />
                <small v-if="errors.titulo" class="text-red-500 text-xs">{{ errors.titulo }}</small>
              </div>

              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">
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
            </div>
          </div>

          <!-- Sección 2: Clasificación -->
          <div class="mb-8">
            <div class="flex items-center gap-2 mb-5">
              <div class="w-1 h-5 rounded-full" style="background:#3b82f6"></div>
              <h2 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Clasificación</h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">
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
                <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">
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
          </div>

          <!-- Error servidor -->
          <Message v-if="errorMsg" severity="error" :closable="false" class="mb-6">
            {{ errorMsg }}
          </Message>

          <!-- Acciones -->
          <div class="flex gap-3 pt-4 border-t border-gray-100">
            <Button
              label="Crear Requerimiento"
              icon="pi pi-plus"
              type="submit"
              :loading="loading"
              class="flex-1"
              style="background:linear-gradient(135deg,#1e3a8a,#3b82f6);border:none"
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
      </div>
    </div>
  </AppLayout>
</template>
