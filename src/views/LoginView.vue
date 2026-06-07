<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Toast from 'primevue/toast'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'

const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorGeneral = ref('')
const errors = ref({ email: '', password: '' })

function validate() {
  errors.value = { email: '', password: '' }
  let valid = true
  if (!email.value.trim()) {
    errors.value.email = 'El correo es requerido'
    valid = false
  }
  if (!password.value) {
    errors.value.password = 'La contraseña es requerida'
    valid = false
  }
  return valid
}

async function handleLogin() {
  errorGeneral.value = ''
  if (!validate()) return
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    toast.add({
      severity: 'success',
      summary: 'Bienvenido',
      detail: 'Sesión iniciada correctamente',
      life: 2000
    })
    setTimeout(() => router.push('/dashboard'), 600)
  } catch (err) {
    const status = err.response?.status
    if (status === 401) {
      errorGeneral.value = 'Correo o contraseña incorrectos'
    } else if (status === 422) {
      errorGeneral.value = 'Datos inválidos. Verifica el correo ingresado.'
    } else {
      errorGeneral.value = 'Error al conectar con el servidor. Intenta de nuevo.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center p-4"
    style="background: linear-gradient(135deg, #0f2557 0%, #1a3a7c 50%, #1e5fa8 100%)"
  >
    <Toast position="top-right" />

    <div class="w-full max-w-md">
      <!-- Encabezado institucional -->
      <div class="text-center mb-8">
        <div
          class="inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg mb-4"
          style="background: rgba(255,255,255,0.15); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.2)"
        >
          <i class="pi pi-shield" style="font-size: 1.75rem; color: #fff"></i>
        </div>
        <h1 class="text-4xl font-black text-white tracking-widest">ReqFlow</h1>
        <p class="text-blue-200 text-sm mt-1 font-medium tracking-wide">
          Gestión de Requerimientos de Software
        </p>
      </div>

      <!-- Card de login -->
      <Card class="shadow-2xl">
        <template #title>
          <div class="flex items-center gap-2 pb-1">
            <i class="pi pi-user text-blue-700"></i>
            <span class="text-base font-semibold text-slate-700">Acceso al sistema</span>
          </div>
        </template>

        <template #content>
          <form @submit.prevent="handleLogin" class="flex flex-col gap-5">
            <!-- Email -->
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-600">
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
                <i class="pi pi-exclamation-circle text-xs"></i>
                {{ errors.email }}
              </small>
            </div>

            <!-- Password -->
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-600">
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
                <i class="pi pi-exclamation-circle text-xs"></i>
                {{ errors.password }}
              </small>
            </div>

            <!-- Error general del servidor -->
            <Message v-if="errorGeneral" severity="error" :closable="false">
              {{ errorGeneral }}
            </Message>

            <!-- Botón submit -->
            <Button
              label="Iniciar sesión"
              type="submit"
              :loading="loading"
              icon="pi pi-sign-in"
              iconPos="right"
              fluid
              class="mt-1"
            />
          </form>
        </template>
      </Card>

      <!-- Link a registro -->
      <p class="text-center mt-5 text-sm" style="color: rgba(191,219,254,0.9)">
        ¿No tienes cuenta?
        <RouterLink
          to="/registro"
          class="text-white font-semibold ml-1 hover:underline underline-offset-2"
        >
          Registrarse
        </RouterLink>
      </p>
    </div>
  </div>
</template>
