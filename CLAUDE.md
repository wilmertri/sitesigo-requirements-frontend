# sitesigo-requirements-frontend

## Que es este proyecto
Frontend del Gestor de Requerimientos SITESIGO.
Interface web para que Administradores, Funcionarios
y Equipo Tecnico gestionen requerimientos de software
del sistema SITESIGO de la Alcaldia de Chia, Colombia.

## Repositorio relacionado
Backend: https://github.com/wilmertri/sitesigo-requirements
API en produccion: https://sitesigo-requirements-production.up.railway.app

## Stack
- Vue 3 (Composition API + script setup)
- Vue Router 4
- Pinia (estado global)
- PrimeVue (componentes UI)
- Tailwind CSS (estilos utilitarios)
- Axios (llamadas HTTP a la API)
- Vite (bundler)
- Vitest (tests unitarios)

## Actores y sus vistas
- Administrador: dashboard completo, gestiona todos
  los requerimientos, cambia estados, archiva
- Funcionario: crea requerimientos, ve todos en
  modo lectura, edita solo los suyos en estado Nuevo
- Equipo tecnico: ve todos, agrega comentarios

## Vistas principales
- /login              Login con email y password
- /registro           Registro de nuevo usuario
- /dashboard          Lista de requerimientos con filtros
- /requerimientos/nuevo    Crear requerimiento
- /requerimientos/:id      Detalle del requerimiento
- /perfil             Datos del usuario actual

## Variables de entorno
VITE_API_URL=http://localhost:8000   (desarrollo)
VITE_API_URL=https://sitesigo-requirements-production.up.railway.app (produccion)

## Convenios de codigo
- Composition API con script setup en todos los componentes
- Un componente por archivo
- Stores Pinia para: auth, requerimientos
- Axios instance con interceptor para JWT token
- Nunca hardcodear URLs — siempre usar VITE_API_URL
- Nombres de componentes en PascalCase
- Nombres de archivos en kebab-case

## Estructura del proyecto
src/
  views/          paginas principales (una por ruta)
  components/     componentes reutilizables
  stores/         estado global con Pinia
  services/       llamadas HTTP con Axios
  router/         configuracion de rutas
  assets/         imagenes y estilos globales

## Flujo de autenticacion
1. Usuario entra a /login
2. POST /auth/token con email y password
3. Token JWT guardado en Pinia store + localStorage
4. Axios interceptor agrega Bearer token en cada request
5. Si token expira → redirigir a /login
6. Rutas protegidas con navigation guard en router

## Como correr el proyecto
npm run dev       desarrollo en localhost:5173
npm run build     build de produccion
npm run test      correr tests con Vitest
npm run preview   preview del build

## Agentes disponibles

### Como iniciar sesion con contexto completo
Al inicio de cada sesion di:
"Lee CLAUDE.md y dime el estado actual
del proyecto frontend."

### Agente de desarrollo frontend
Usar para implementar vistas y componentes:
"Actua como desarrollador Vue 3 experto.
Lee CLAUDE.md y implementa: [nombre de la vista]"

## Estado actual del proyecto

### Completado
- Instalacion Vue 3 + PrimeVue + Tailwind + Axios
- Estructura de carpetas inicializada por Vite
- Repositorio GitHub conectado

### Pendiente
- Configuracion de PrimeVue en main.js
- Configuracion de Tailwind
- Axios instance con interceptor JWT
- Store de autenticacion (Pinia)
- Store de requerimientos (Pinia)
- Router con rutas protegidas
- Vista Login
- Vista Registro
- Vista Dashboard (lista de requerimientos)
- Vista Nuevo Requerimiento
- Vista Detalle Requerimiento
- Dockerfile frontend
- Deploy en Vercel

## Notas importantes
- El backend ya esta en produccion en Railway
- JWT token expira en 30 minutos
- El rol del usuario viene en el token JWT
- Los endpoints requieren header Authorization: Bearer token
- POST /auth/token usa form-data no JSON (OAuth2)
