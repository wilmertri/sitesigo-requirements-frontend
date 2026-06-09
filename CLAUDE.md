# ReqFlow — Frontend

## Que es este proyecto
Herramienta SaaS para gestionar requerimientos de software.
Independiente de cualquier cliente especifico.
Interface web para que Administradores, Funcionarios
y Equipo Tecnico gestionen requerimientos de software.

## URLs
Frontend produccion: https://reqflow-requirements.vercel.app
Backend repo: https://github.com/wilmertri/sitesigo-requirements
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
- /login                          Login con email y password
- /registro                       Registro de nuevo usuario
- /dashboard                      Lista de requerimientos con filtros
- /requerimientos/nuevo            Crear requerimiento
- /requerimientos/:id              Detalle del requerimiento
- /perfil                         Datos del usuario actual
- /proyectos                      Gestion de proyectos (super_admin)
- /proyectos/:id/usuarios         Usuarios de un proyecto (admin+)
- /configuracion/proyecto/:id     Campos y estados por proyecto (super_admin)

## Variables de entorno
VITE_API_URL=http://localhost:8000   (desarrollo)
VITE_API_URL=https://sitesigo-requirements-production.up.railway.app (produccion)

## Convenios de codigo
- Composition API con script setup en todos los componentes
- Un componente por archivo
- Stores Pinia para: auth, requerimientos, theme, config, projects
- Axios instance con interceptor para JWT token
- Nunca hardcodear URLs — siempre usar VITE_API_URL
- Nombres de componentes en PascalCase
- Nombres de archivos en kebab-case
- Navigation guards con return (no next()) — Vue Router 5

## Estructura del proyecto
src/
  views/          paginas principales (una por ruta)
  components/     componentes reutilizables
  composables/    logica reutilizable (useBadges)
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
- Store de requerimientos Pinia (src/stores/requirements.js)
- Store de tema dark/light (src/stores/theme.js) con persistencia localStorage
- Store de configuracion (src/stores/config.js) — campos y estados por proyecto
- Store de proyectos (src/stores/projects.js)
- Router con navigation guard (Vue Router 5 API)
- AppLayout compartido (header + sidebar)
  - Sidebar colapsable en mobile con hamburger y overlay
  - Boton dark mode toggle (luna/sol) en header
  - Link "Usuarios" en sidebar para admin con proyecto asignado
- useBadges composable con soporte dark/light mode
- Vista Login completa — error persistente, sin recarga en 401
- Vista Registro — nombre, email, password, rol; redirige a /login
- Vista Dashboard con DataTable, filtros, badges y contadores animados
- Vista Nuevo Requerimiento — grid 2 columnas ancho completo, boton a la derecha
- Vista Detalle con panel admin (cambiar estado, archivar, estado del proyecto)
  - Panel "Campos adicionales" con edicion inline para admin/autor
- Vista Perfil con datos del usuario y logout
- Vista 404 personalizada con branding ReqFlow
- Vista Proyectos (super_admin) con lista y crear proyecto
- Vista ProyectoUsuarios — gestionar usuarios de un proyecto
- Vista ConfiguracionProyecto (super_admin)
  - Tabla de campos configurables con badge de tipo y flag obligatorio
  - Tabla de estados del proyecto con color, orden y flag terminal
  - Dialog "Nuevo campo": nombre, clave auto-generada, tipo, obligatorio, opciones para lista
  - Dialog "Nuevo estado": color picker nativo, orden, es_terminal, preview del badge
- Componente CamposConfigurables — renderizador dinamico de campos por proyecto
  - Grid 4 columnas en desktop: texto = ancho completo, resto = 1 col
  - Soporte readonly (modo detalle) y editable (modo nuevo/edicion)
  - Campo calculado (dias habiles) recalcula al cambiar fechas
- Dark mode completo: sidebar, cards, tabla, badges, inputs, dialogs
- Responsive mobile: cards 2x2, tabla con scroll horizontal,
  formularios en columna unica en mobile
- vercel.json para SPA routing
- Deploy en Vercel: https://reqflow-requirements.vercel.app

### Pendiente
- Dockerfile frontend

## Campos configurables por proyecto (SITESIGO)
El backend expone endpoints para configurar campos y estados
adicionales por proyecto. El frontend los consume via configStore.

### Endpoints
- GET  /proyectos/:id/campos           lista de campos configurados
- POST /proyectos/:id/campos           crear campo
- GET  /proyectos/:id/estados          lista de estados configurados
- POST /proyectos/:id/estados          crear estado
- GET  /proyectos/:id/dias-habiles     calcula dias entre dos fechas
- PUT  /requerimientos/:id/valores     guarda valores adicionales

### Tipos de campo soportados
- texto     → InputText, ancho completo (md:col-span-4)
- numero    → InputNumber, 1 columna
- lista     → Select con opciones configuradas, 1 columna
- fecha     → input[type=date] nativo con estilos PrimeVue, 1 columna
- calculado → readonly, muestra dias habiles entre fecha_inicio y fecha_final

### Cache en configStore
Los campos y estados se cachean por proyectoId.
Llamar configStore.invalidar(proyectoId) tras crear/editar campos o estados.

## Notas importantes
- JWT token expira en 30 minutos
- El rol del usuario viene en el token JWT
- Los endpoints requieren header Authorization: Bearer token
- POST /auth/token usa form-data no JSON (OAuth2)
- Navigation guards usan return en lugar de next() (Vue Router 5)
- Roles disponibles: super_admin, administrador, funcionario, equipo_tecnico

## Convenciones y errores comunes

### Interceptores de Axios
El interceptor de 401 en src/services/api.js excluye endpoints publicos
para evitar que errores normales causen recarga de pagina.

Endpoints excluidos del redirect a /login:

const esEndpointPublico =
    error.config?.url?.includes('/auth/token') ||
    error.config?.url?.includes('/auth/registro')

Si agregas nuevos endpoints publicos que puedan devolver 401,
agregalos a esta lista.

### useBadges y dark mode
useBadges acepta un isDarkRef (computed(() => themeStore.isDark)).
Los estilos de badge son inline, por lo que NO pueden ser
sobreescritos por CSS global. El composable genera los colores
correctos para cada modo directamente en el style string.

### CamposConfigurables en dark mode
El input[type=date] nativo requiere estilos inline via inputFechaStyle()
porque Tailwind no puede estilizar elementos nativos del navegador
en todos los contextos.

### Commits en PowerShell
Usar here-string de PowerShell para mensajes multilinea.
Evitar apostrofes/comillas simples dentro del mensaje:

$msg = @'
mensaje aqui
'@
git commit -m $msg
