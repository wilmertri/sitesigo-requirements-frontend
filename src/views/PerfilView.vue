<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import AppLayout from '../components/AppLayout.vue'
import Card from 'primevue/card'
import Button from 'primevue/button'

const router = useRouter()
const auth   = useAuthStore()

const ROL_CONFIG = {
    super_admin:    { label: 'Super Administrador', bg: '#fce7f3', color: '#9d174d' },
    administrador:  { label: 'Administrador',       bg: '#fef9c3', color: '#854d0e' },
    funcionario:    { label: 'Funcionario',          bg: '#dbeafe', color: '#1e40af' },
    equipo_tecnico: { label: 'Equipo Técnico',       bg: '#dcfce7', color: '#166534' },
    equipo:         { label: 'Equipo Técnico',       bg: '#dcfce7', color: '#166534' },
}

function formatearRol(rol) {
    const roles = {
        'super_admin':    'Super Administrador',
        'administrador':  'Administrador',
        'funcionario':    'Funcionario',
        'equipo_tecnico': 'Equipo Técnico',
    }
    return roles[rol] || rol
}

const rolInfo = computed(() => {
    const key = (auth.user?.rol ?? '').toLowerCase()
    return ROL_CONFIG[key] ?? { label: auth.user?.rol ?? 'Sin rol', bg: '#f3f4f6', color: '#6b7280' }
})

function formatFecha(f) {
    if (!f) return null
    return new Date(f).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
}

function cerrarSesion() {
    auth.logout()
    router.push('/login')
}
</script>

<template>
  <AppLayout>
    <!-- Encabezado de página -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-slate-800">Perfil</h1>
      <p class="text-sm text-slate-500 mt-0.5">Información de tu cuenta</p>
    </div>

    <div class="max-w-lg flex flex-col gap-4">
      <!-- Card datos del usuario -->
      <Card class="shadow-sm">
        <template #title>
          <div class="flex items-center gap-2 text-base">
            <i class="pi pi-user text-blue-600"></i>
            Datos del usuario
          </div>
        </template>
        <template #content>
          <!-- Avatar inicial -->
          <div class="flex items-center gap-4 mb-6 pb-5 border-b border-slate-100">
            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-blue-900 to-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
              {{ (auth.user?.nombre || auth.user?.email || 'U')[0].toUpperCase() }}
            </div>
            <div>
              <p class="text-lg font-bold text-slate-800">
                {{ auth.user?.nombre || 'Sin nombre' }}
              </p>
              <p class="text-sm text-slate-500">{{ auth.user?.email }}</p>
            </div>
          </div>

          <!-- Campos -->
          <div class="flex flex-col gap-4">
            <div class="flex items-center justify-between py-2 border-b border-slate-50">
              <span class="text-sm font-medium text-slate-500">Nombre completo</span>
              <span class="text-sm text-slate-800 font-medium">{{ auth.user?.nombre || '—' }}</span>
            </div>

            <div class="flex items-center justify-between py-2 border-b border-slate-50">
              <span class="text-sm font-medium text-slate-500">Correo electrónico</span>
              <span class="text-sm text-slate-800">{{ auth.user?.email }}</span>
            </div>

            <div class="flex items-center justify-between py-2 border-b border-slate-50">
              <span class="text-sm font-medium text-slate-500">Rol en el sistema</span>
              <span
                class="px-3 py-0.5 rounded-full text-xs font-semibold"
                :style="`background:${rolInfo.bg};color:${rolInfo.color}`"
              >
                {{ rolInfo.label }}
              </span>
            </div>

            <div v-if="formatFecha(auth.user?.fecha_registro)" class="flex items-center justify-between py-2 border-b border-slate-50">
              <span class="text-sm font-medium text-slate-500">Miembro desde</span>
              <span class="text-sm text-slate-800">{{ formatFecha(auth.user?.fecha_registro) }}</span>
            </div>

            <div v-if="auth.user?.id" class="flex items-center justify-between py-2">
              <span class="text-sm font-medium text-slate-500">ID de usuario</span>
              <span class="text-sm text-slate-400 font-mono">#{{ auth.user.id }}</span>
            </div>
          </div>
        </template>
      </Card>

      <!-- Card cerrar sesión -->
      <Card class="shadow-sm border border-red-100">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-slate-700">Cerrar sesión</p>
              <p class="text-sm text-slate-500 mt-0.5">Tu sesión se cerrará en este dispositivo</p>
            </div>
            <Button
              label="Cerrar Sesión"
              icon="pi pi-sign-out"
              severity="danger"
              outlined
              @click="cerrarSesion"
            />
          </div>
        </template>
      </Card>
    </div>
  </AppLayout>
</template>
