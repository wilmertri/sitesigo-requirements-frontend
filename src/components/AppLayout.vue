<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'
import { useRequirementsStore } from '../stores/requirements'
import api from '../services/api'
import Button from 'primevue/button'
import Tag from 'primevue/tag'

const router     = useRouter()
const route      = useRoute()
const authStore  = useAuthStore()
const themeStore = useThemeStore()
const reqStore   = useRequirementsStore()

const navItems = computed(() => {
    const items = [
        { label: 'Dashboard', icon: 'pi pi-home', path: '/dashboard' },
    ]

    if (authStore.isSuperAdmin) {
        items.push({ label: 'Proyectos', icon: 'pi pi-sitemap', path: '/proyectos' })
    }

    if (authStore.isAdmin && authStore.user?.proyecto_id) {
        items.push({
            label: 'Usuarios',
            icon:  'pi pi-users',
            path:  `/proyectos/${authStore.user.proyecto_id}/usuarios`,
        })
    }

    items.push({ label: 'Nuevo Requerimiento', icon: 'pi pi-plus-circle', path: '/requerimientos/nuevo' })
    items.push({ label: 'Perfil',              icon: 'pi pi-user',        path: '/perfil' })

    return items
})

// Nombre del proyecto del usuario autenticado (para admin)
const nombreProyecto = ref(null)

watch(
    () => authStore.user?.proyecto_id,
    async (proyectoId) => {
        if (!proyectoId) { nombreProyecto.value = null; return }
        try {
            const r = await api.get(`/proyectos/${proyectoId}`)
            nombreProyecto.value = r.data.nombre
        } catch {
            nombreProyecto.value = null
        }
    },
    { immediate: true }
)

watch(
    () => authStore.user,
    () => { /* fuerza seguimiento de authStore.user como dependencia reactiva */ },
    { immediate: true, deep: true }
)

function rolTag() {
    if (authStore.isSuperAdmin) return { value: 'Super Admin', severity: 'danger' }
    if (authStore.isAdmin)      return { value: 'Admin',       severity: 'warn' }
    return null
}

function isActive(path) {
    if (path === '/dashboard') return route.path === '/dashboard'
    return route.path === path || route.path.startsWith(path + '/')
}

function handleLogout() {
    reqStore.limpiar()
    authStore.logout()
    router.push('/login')
}

// ── Sidebar mobile ─────────────────────────────────────────────────────────────
const sidebarAbierto = ref(false)
const toggleSidebar  = () => { sidebarAbierto.value = !sidebarAbierto.value }

// Cierra el sidebar al navegar
watch(() => route.path, () => { sidebarAbierto.value = false })

// Cierra el sidebar si la pantalla se hace grande
function onResize() { if (window.innerWidth >= 768) sidebarAbierto.value = false }
onMounted(()   => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))
</script>

<template>
  <div class="min-h-screen flex flex-col" style="background:#f1f5f9">
    <!-- ── Header ──────────────────────────────────────────────── -->
    <header
      class="h-14 flex items-center justify-between px-4 md:px-6 shadow-md z-10 shrink-0"
      style="background:#1e3a8a"
    >
      <div class="flex items-center gap-3">
        <!-- Botón hamburger — solo mobile -->
        <button
          @click="toggleSidebar"
          class="md:hidden p-2 rounded-lg hover:bg-blue-900 text-white mr-1"
          aria-label="Abrir menú"
        >
          <i class="pi pi-bars text-lg"></i>
        </button>

        <div class="flex items-center gap-3">
          <img src="@/assets/icon-reqflow.png" alt="ReqFlow" class="h-8 w-8 rounded-lg" />
          <span class="font-semibold text-lg text-white">ReqFlow</span>
        </div>
        <span
          v-if="nombreProyecto"
          class="hidden sm:inline text-xs font-medium px-2 py-0.5 rounded"
          style="background:rgba(255,255,255,0.12);color:rgba(191,219,254,0.9)"
        >
          {{ nombreProyecto }}
        </span>
      </div>

      <div class="flex items-center gap-2 md:gap-3">
        <!-- Toggle dark mode -->
        <button
          @click="themeStore.toggleDark()"
          class="p-2 rounded-lg transition-colors hover:bg-white/10 text-white"
          :title="themeStore.isDark ? 'Modo claro' : 'Modo oscuro'"
        >
          <i :class="themeStore.isDark ? 'pi pi-sun' : 'pi pi-moon'" class="text-lg"></i>
        </button>

        <div class="hidden sm:flex items-center gap-2 text-sm" style="color:rgba(191,219,254,0.9)">
          <i class="pi pi-user text-xs"></i>
          <span>{{ authStore.user?.nombre || authStore.user?.email || 'Usuario' }}</span>
          <Tag
            v-if="rolTag()"
            :value="rolTag().value"
            :severity="rolTag().severity"
            class="text-xs py-0"
          />
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

    <div class="flex flex-1 min-h-0 relative">
      <!-- ── Overlay oscuro en mobile ────────────────────────── -->
      <div
        v-if="sidebarAbierto"
        @click="sidebarAbierto = false"
        class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
      ></div>

      <!-- ── Sidebar ──────────────────────────────────────────── -->
      <aside
        :class="[
          'fixed inset-y-0 left-0 z-50 w-52 flex flex-col pt-3',
          'transform transition-transform duration-300 ease-in-out',
          'md:relative md:translate-x-0 md:flex',
          sidebarAbierto ? 'translate-x-0' : '-translate-x-full'
        ]"
        style="background:#172554"
      >
        <!-- Header del sidebar en mobile (para mostrar nombre usuario) -->
        <div class="sm:hidden px-4 py-3 border-b border-blue-900 mb-1">
          <div class="flex items-center gap-2 text-sm" style="color:rgba(191,219,254,0.9)">
            <i class="pi pi-user text-xs"></i>
            <span class="truncate">{{ authStore.user?.nombre || authStore.user?.email || 'Usuario' }}</span>
          </div>
        </div>

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
      <main
        class="flex-1 p-4 md:p-6 overflow-auto"
        :class="themeStore.isDark ? 'dark-bg-content' : ''"
      >
        <slot />
      </main>
    </div>
  </div>
</template>
