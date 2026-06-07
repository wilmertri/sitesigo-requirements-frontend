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
        path: '/registro',
        name: 'Registro',
        component: () => import('../views/RegistroView.vue'),
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
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to) => {
    const auth = useAuthStore()
    if (to.meta.requiresAuth && !auth.isAuthenticated) {
        return '/login'
    }
    if (!to.meta.requiresAuth && auth.isAuthenticated && to.path !== '/registro') {
        return '/dashboard'
    }
})

export default router
