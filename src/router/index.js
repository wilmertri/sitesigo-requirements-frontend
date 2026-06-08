import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/LoginView.vue'),
        meta: { requiresAuth: false }
    },
    {
        path: '/',
        redirect: '/dashboard'
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('../views/DashboardView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/requerimientos/nuevo',
        name: 'NuevoRequerimiento',
        component: () => import('../views/NuevoRequerimientoView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/requerimientos/:id',
        name: 'DetalleRequerimiento',
        component: () => import('../views/DetalleRequerimientoView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/perfil',
        name: 'Perfil',
        component: () => import('../views/PerfilView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/proyectos',
        name: 'Proyectos',
        component: () => import('../views/ProyectosView.vue'),
        meta: { requiresAuth: true, requiresSuperAdmin: true }
    },
    {
        path: '/proyectos/:id/usuarios',
        name: 'ProyectoUsuarios',
        component: () => import('../views/ProyectoUsuariosView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('../views/NotFoundView.vue'),
        meta: { requiresAuth: false }
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to) => {
    const auth = useAuthStore()
    if (to.meta.requiresAuth && !auth.isAuthenticated) return '/login'
    if (!to.meta.requiresAuth && auth.isAuthenticated && to.name !== 'NotFound') return '/dashboard'
    if (to.meta.requiresSuperAdmin && !auth.isSuperAdmin) return '/dashboard'
})

export default router
