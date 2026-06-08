# ReqFlow — Frontend

Herramienta SaaS para gestionar requerimientos de software.

**Produccion:** https://reqflow-requirements.vercel.app
**API backend:** https://sitesigo-requirements-production.up.railway.app

## Stack

- Vue 3 (Composition API + script setup)
- Vue Router 5
- Pinia 3
- PrimeVue 4 con tema Aura
- Tailwind CSS 4
- Axios
- Vite 8

## Desarrollo local

```sh
npm install
npm run dev       # localhost:5173
npm run build     # build de produccion
npm run test:unit # tests con Vitest
```

## Variables de entorno

```
VITE_API_URL=http://localhost:8000        # desarrollo
VITE_API_URL=https://sitesigo-requirements-production.up.railway.app  # produccion
```
