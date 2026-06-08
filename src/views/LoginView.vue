<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'
import { useToast } from 'primevue/usetoast'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Toast from 'primevue/toast'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'

const router     = useRouter()
const auth       = useAuthStore()
const toast      = useToast()
const themeStore = useThemeStore()

const email    = ref('')
const password = ref('')
const loading  = ref(false)
const error    = ref('')
const errors   = ref({ email: '', password: '' })

watch([email, password], () => {
    if (error.value) error.value = ''
})

function validate() {
    errors.value = { email: '', password: '' }
    let valid = true
    if (!email.value.trim())  { errors.value.email    = 'El correo es requerido';    valid = false }
    if (!password.value)      { errors.value.password = 'La contraseña es requerida'; valid = false }
    return valid
}

async function handleLogin() {
    error.value = ''
    if (!validate()) return
    loading.value = true
    try {
        await auth.login(email.value, password.value)
        toast.add({ severity: 'success', summary: 'Bienvenido', detail: 'Sesión iniciada correctamente', life: 2000 })
        setTimeout(() => router.push('/dashboard'), 600)
    } catch (err) {
        const status = err.response?.status
        if (status === 401)      error.value = 'Correo o contraseña incorrectos'
        else if (status === 422) error.value = 'Datos inválidos. Verifica el correo ingresado.'
        else                     error.value = 'Error al conectar con el servidor. Intenta de nuevo.'
    } finally {
        loading.value = false
    }
}
</script>

<template>
  <div class="min-h-screen flex">
    <Toast position="top-right" />

    <!-- Columna izquierda — solo desktop -->
    <div
      class="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
      style="background-color:#0f2557;background-image:radial-gradient(circle at 1px 1px,rgba(255,255,255,0.15) 1px,transparent 0);background-size:32px 32px"
    >
      <div></div>

      <div class="flex flex-col items-center text-center">
        <img src="@/assets/icon-reqflow.png" alt="ReqFlow" class="h-24 w-24 mb-8" style="border-radius:0;box-shadow:none" />
        <h1 class="text-4xl font-bold text-white mb-3">ReqFlow</h1>
        <p class="text-blue-300 text-lg mb-12">Gestión profesional de requerimientos de software</p>

        <div class="flex flex-col gap-4 text-left w-full max-w-sm">
          <div v-for="feat in [
            'Trazabilidad completa de requerimientos',
            'Roles y permisos por proyecto',
            'Notificaciones automáticas por email'
          ]" :key="feat" class="flex items-center gap-3">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style="background:rgba(255,255,255,0.15)"
            >
              <i class="pi pi-check text-sm" style="color:#34d399"></i>
            </div>
            <span class="text-blue-100 text-sm">{{ feat }}</span>
          </div>
        </div>
      </div>

      <div class="text-center">
        <span class="text-blue-400 text-xs">v1.0</span>
      </div>
    </div>

    <!-- Columna derecha -->
    <div class="flex-1 flex items-center justify-center p-8" style="background:#f8fafc">
      <div class="w-full max-w-md">

        <!-- Logo móvil -->
        <div class="lg:hidden flex flex-col items-center mb-8">
          <img src="@/assets/icon-reqflow.png" alt="ReqFlow" class="h-16 w-16 mb-3" />
          <h1 class="text-2xl font-bold text-gray-800">ReqFlow</h1>
        </div>

        <!-- Card -->
        <div class="bg-white rounded-2xl shadow-xl p-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-1">Bienvenido</h2>
          <p class="text-gray-500 text-sm mb-8">Ingresa tus credenciales para continuar</p>

          <form @submit.prevent="handleLogin" class="flex flex-col gap-5">
            <!-- Email -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Correo electrónico
              </label>
              <IconField>
                <InputIcon class="pi pi-envelope" />
                <InputText
                  v-model="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  fluid
                  :invalid="!!errors.email"
                  autocomplete="email"
                />
              </IconField>
              <small v-if="errors.email" class="text-red-500 text-xs flex items-center gap-1">
                <i class="pi pi-exclamation-circle text-xs"></i>{{ errors.email }}
              </small>
            </div>

            <!-- Password -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Contraseña
              </label>
              <Password
                v-model="password"
                :feedback="false"
                toggleMask
                fluid
                :invalid="!!errors.password"
                placeholder="••••••••"
                autocomplete="current-password"
              />
              <small v-if="errors.password" class="text-red-500 text-xs flex items-center gap-1">
                <i class="pi pi-exclamation-circle text-xs"></i>{{ errors.password }}
              </small>
            </div>

            <!-- Error general -->
            <div
              v-if="error"
              class="flex items-center gap-3 p-4 rounded-xl border"
              :style="themeStore.isDark
                ? 'background:#7f1d1d;border-color:#991b1b;color:#fca5a5'
                : 'background:#fee2e2;border-color:#fca5a5;color:#b91c1c'"
            >
              <i class="pi pi-exclamation-circle text-lg flex-shrink-0"></i>
              <div class="flex-1">
                <p class="font-medium text-sm">Credenciales incorrectas</p>
                <p class="text-xs mt-0.5 opacity-80">{{ error }}</p>
              </div>
              <button @click="error = ''" class="opacity-60 hover:opacity-100">
                <i class="pi pi-times text-sm"></i>
              </button>
            </div>

            <!-- Submit -->
            <Button
              label="Iniciar sesión"
              type="submit"
              :loading="loading"
              icon="pi pi-sign-in"
              iconPos="right"
              fluid
              class="mt-1"
              style="background:linear-gradient(135deg,#1e3a8a,#3b82f6) !important;border:none !important"
            />
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
