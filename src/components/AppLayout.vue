<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Button from 'primevue/button'
import Tag from 'primevue/tag'

const router = useRouter()
const route  = useRoute()
const auth   = useAuthStore()

const navItems = [
    { label: 'Dashboard',          icon: 'pi pi-home',        path: '/dashboard' },
    { label: 'Nuevo Requerimiento', icon: 'pi pi-plus-circle', path: '/requerimientos/nuevo' },
    { label: 'Perfil',             icon: 'pi pi-user',        path: '/perfil' },
]

function isActive(path) { return route.path === path }

function handleLogout() {
    auth.logout()
    router.push('/login')
}
</script>

<template>
  <div class="min-h-screen flex flex-col" style="background:#f1f5f9">
    <!-- ── Header ──────────────────────────────────────────────── -->
    <header
      class="h-14 flex items-center justify-between px-6 shadow-md z-10 shrink-0"
      style="background:#1e3a8a"
    >
      <div class="flex items-center gap-2">
        <i class="pi pi-shield text-white text-lg"></i>
        <span class="text-lg font-black tracking-widest text-white">ReqFlow</span>
      </div>

      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2 text-sm" style="color:rgba(191,219,254,0.9)">
          <i class="pi pi-user text-xs"></i>
          <span>{{ auth.user?.nombre || auth.user?.email || 'Usuario' }}</span>
          <Tag v-if="auth.isAdmin" value="Admin" severity="warn" class="text-xs py-0" />
        </div>
        <Button
          icon="pi pi-sign-out"
          label="Salir"
          text
          size="small"
          style="color:rgba(191,219,254,0.9)"
          @click="handleLogout"
        />
      </div>
    </header>

    <div class="flex flex-1 min-h-0">
      <!-- ── Sidebar ──────────────────────────────────────────── -->
      <aside class="w-52 shrink-0 flex flex-col pt-3" style="background:#172554">
        <nav class="flex flex-col gap-0.5 px-2">
          <RouterLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
            :class="isActive(item.path)
              ? 'bg-blue-700 text-white'
              : 'text-blue-300 hover:bg-blue-900 hover:text-white'"
          >
            <i :class="[item.icon, 'text-base w-4']"></i>
            {{ item.label }}
          </RouterLink>
        </nav>
      </aside>

      <!-- ── Contenido (slot) ─────────────────────────────────── -->
      <main class="flex-1 p-6 overflow-auto">
        <slot />
      </main>
    </div>
  </div>
</template>
