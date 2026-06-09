<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useThemeStore } from '../stores/theme'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'
import AppLayout from '../components/AppLayout.vue'
import CamposConfigurables from '../components/CamposConfigurables.vue'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Toast from 'primevue/toast'

const router     = useRouter()
const toast      = useToast()
const themeStore = useThemeStore()
const authStore  = useAuthStore()

const titulo              = ref('')
const descripcion         = ref('')
const tipo                = ref(null)
const prioridad           = ref(null)
const valoresAdicionales  = ref({})
const loading             = ref(false)
const errorMsg            = ref('')
const errors              = ref({})

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
            titulo:               titulo.value.trim(),
            descripcion:          descripcion.value.trim(),
            tipo:                 tipo.value,
            prioridad:            prioridad.value,
            valores_adicionales:  valoresAdicionales.value,
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
      class="mb-5"
      @click="router.push('/dashboard')"
    />

    <div
      class="rounded-2xl shadow-lg overflow-hidden"
      :class="themeStore.isDark ? 'bg-slate-800' : 'bg-white'"
    >
      <!-- Card header -->
      <div
        class="px-6 py-5 border-b"
        :class="themeStore.isDark ? 'bg-slate-700 border-slate-600' : 'border-gray-100'"
        :style="themeStore.isDark ? '' : 'background:linear-gradient(135deg,#f8fafc,#f0f4ff)'"
      >
        <div class="flex items-center gap-4">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            :style="themeStore.isDark ? 'background:#1e3a8a' : 'background:#0f2557'"
          >
            <i class="pi pi-file-plus text-white text-lg"></i>
          </div>
          <div>
            <h1 :class="themeStore.isDark ? 'text-white' : 'text-gray-800'" class="text-lg font-bold">
              Nuevo Requerimiento
            </h1>
            <p :class="themeStore.isDark ? 'text-slate-400' : 'text-gray-500'" class="text-xs mt-0.5">
              Completa los campos para registrar el requerimiento
            </p>
          </div>
        </div>
      </div>

      <!-- Form body -->
      <form @submit.prevent="crear" class="p-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <!-- Titulo — ancho completo -->
          <div class="sm:col-span-2 flex flex-col gap-1.5">
            <label class="text-xs font-medium uppercase tracking-wide"
                   :class="themeStore.isDark ? 'text-slate-400' : 'text-gray-500'">
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

          <!-- Tipo -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium uppercase tracking-wide"
                   :class="themeStore.isDark ? 'text-slate-400' : 'text-gray-500'">
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

          <!-- Prioridad -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium uppercase tracking-wide"
                   :class="themeStore.isDark ? 'text-slate-400' : 'text-gray-500'">
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

          <!-- Descripcion — ancho completo -->
          <div class="sm:col-span-2 flex flex-col gap-1.5">
            <label class="text-xs font-medium uppercase tracking-wide"
                   :class="themeStore.isDark ? 'text-slate-400' : 'text-gray-500'">
              Descripción <span class="text-red-500">*</span>
            </label>
            <Textarea
              v-model="descripcion"
              placeholder="Explica con detalle el requerimiento, contexto e impacto esperado…"
              :rows="4"
              fluid
              :invalid="!!errors.descripcion"
              :auto-resize="false"
            />
            <small v-if="errors.descripcion" class="text-red-500 text-xs">{{ errors.descripcion }}</small>
          </div>

          <!-- Campos adicionales — el componente maneja su grid interna -->
          <div v-if="authStore.user?.proyecto_id" class="sm:col-span-2 border-t pt-4"
               :class="themeStore.isDark ? 'border-slate-600' : 'border-gray-100'">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-1 h-4 rounded-full" style="background:#10b981"></div>
              <h2 class="text-xs font-semibold uppercase tracking-wider"
                  :class="themeStore.isDark ? 'text-slate-400' : 'text-gray-500'">
                Campos adicionales
              </h2>
            </div>
            <CamposConfigurables
              :proyecto-id="authStore.user.proyecto_id"
              v-model="valoresAdicionales"
            />
          </div>

          <!-- Error servidor -->
          <Message v-if="errorMsg" severity="error" :closable="false" class="sm:col-span-2">
            {{ errorMsg }}
          </Message>

          <!-- Acciones — alineadas a la derecha -->
          <div class="sm:col-span-2 flex justify-end gap-3 pt-4 border-t"
               :class="themeStore.isDark ? 'border-slate-600' : 'border-gray-100'">
            <Button
              label="Cancelar"
              icon="pi pi-times"
              severity="secondary"
              outlined
              :disabled="loading"
              @click="router.push('/dashboard')"
            />
            <Button
              label="Crear Requerimiento"
              icon="pi pi-plus"
              type="submit"
              :loading="loading"
              style="background:linear-gradient(135deg,#1e3a8a,#3b82f6);border:none"
            />
          </div>

        </div>
      </form>
    </div>
  </AppLayout>
</template>
