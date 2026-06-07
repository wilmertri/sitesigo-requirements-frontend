# ReqFlow — Frontend

## Que es este proyecto
Herramienta SaaS para gestionar requerimientos de software.
Independiente de cualquier cliente especifico.
Interface web para que Administradores, Funcionarios
y Equipo Tecnico gestionen requerimientos de software.

## Repositorio relacionado
Backend: https://github.com/wilmertri/sitesigo-requirements
API en produccion: https://sitesigo-requirements-production.up.railway.app

## Stack
- Vue 3 (Composition API + script setup)
- Vue Router 5
- Pinia 3 (estado global)
- PrimeVue 4 con tema Aura (componentes UI)
- Tailwind CSS 4 (estilos utilitarios, via @tailwindcss/vite)
- Axios (llamadas HTTP a la API)
- Vite 8 (bundler)
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
- Navigation guards con return (no next()) — Vue Router 5

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
npm run test:unit correr tests con Vitest
npm run preview   preview del build

## Agentes disponibles

### Como iniciar sesion con contexto completo
Al inicio de cada sesion di:
"Lee CLAUDE.md y dime el estado actual
del proyecto frontend."

### Agente de desarrollo frontend
Usar para implementar vistas y componentes:
"Actua como desarrollador Vue 3 experto.
Lee CLAUDE.md e implementa: [nombre de la vista]"

## Estado actual del proyecto

### Completado
- Instalacion Vue 3 + PrimeVue + Tailwind + Axios
- Estructura de carpetas
- Variables de entorno (.env.development / .env.production)
- Axios instance con interceptores JWT (src/services/api.js)
- Store de autenticacion Pinia (src/stores/auth.js)
- Router con navigation guard (Vue Router 5 API)
- Vista Login completa con PrimeVue + gradiente azul

### Pendiente
- Vista Registro
- Vista Dashboard (lista de requerimientos)
- Vista Nuevo Requerimiento
- Vista Detalle Requerimiento
- Vista Perfil
- Store de requerimientos (Pinia)
- Dockerfile frontend
- Deploy en Vercel

## Notas importantes
- JWT token expira en 30 minutos
- El rol del usuario viene en el token JWT
- Los endpoints requieren header Authorization: Bearer token
- POST /auth/token usa form-data no JSON (OAuth2)
- Navigation guards usan return en lugar de next() (Vue Router 5)
