<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectsStore } from '../stores/projects'
import { useToast } from 'primevue/usetoast'
import AppLayout from '../components/AppLayout.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Message from 'primevue/message'
import Toast from 'primevue/toast'
import ProgressSpinner from 'primevue/progressspinner'

const route = useRoute()
const store = useProjectsStore()
const toast = useToast()

const proyectoId = computed(() => route.params.id)

// ── Dialog ──────────────────────────────────────────────────────────────────
const dialogVisible = ref(false)
const nuevoUsuario  = ref({ nombre: '', email: '', rol: null, password: '' })
const errorNombre   = ref('')
const errorEmail    = ref('')
const errorRol      = ref('')
const errorMsg      = ref('')
const agregando     = ref(false)

const opcionesRol = [
    { label: 'Administrador', value: 'administrador' },
    { label: 'Funcionario',   value: 'funcionario' },
    { label: 'Equipo técnico', value: 'equipo_tecnico' },
]

const ROL_STYLE = {
    administrador:  'background:#dbeafe;color:#1e40af',
    funcionario:    'background:#dcfce7;color:#166534',
    equipo_tecnico: 'background:#ffedd5;color:#9a3412',
}
const ROL_LABEL = {
    administrador:  'Administrador',
    funcionario:    'Funcionario',
    equipo_tecnico: 'Equipo técnico',
}

function norm(v) { return (v ?? '').toLowerCase().replace(/\s+/g, '_') }
function rolStyle(v) { return ROL_STYLE[norm(v)] ?? 'background:#f3f4f6;color:#6b7280' }
function rolLabel(v) { return ROL_LABEL[norm(v)] ?? v }

// Nombre del proyecto actual
const nombreProyecto = computed(() => {
    const p = store.proyectos.find(p => String(p.id) === String(proyectoId.value))
    return p?.nombre ?? `Proyecto #${proyectoId.value}`
})

function abrirDialog() {
    nuevoUsuario.value  = { nombre: '', email: '', rol: null, password: '' }
    errorNombre.value   = ''
    errorEmail.value    = ''
    errorRol.value      = ''
    errorMsg.value      = ''
    dialogVisible.value = true
}

async function agregarUsuario() {
    errorNombre.value = ''
    errorEmail.value  = ''
    errorRol.value    = ''
    errorMsg.value    = ''

    let valid = true
    if (!nuevoUsuario.value.nombre.trim()) { errorNombre.value = 'El nombre es obligatorio'; valid = false }
    if (!nuevoUsuario.value.email.trim())  { errorEmail.value  = 'El email es obligatorio';  valid = false }
    if (!nuevoUsuario.value.rol)           { errorRol.value    = 'Selecciona un rol';         valid = false }
    if (!valid) return

    agregando.value = true
    try {
        await store.agregarUsuario(proyectoId.value, {
            nombre:   nuevoUsuario.value.nombre.trim(),
            email:    nuevoUsuario.value.email.trim(),
            rol:      nuevoUsuario.value.rol,
            password: nuevoUsuario.value.password.trim() || undefined,
        })
        dialogVisible.value = false
        toast.add({ severity: 'success', summary: 'Usuario agregado', detail: nuevoUsuario.value.email.trim(), life: 3000 })
    } catch (e) {
        const status = e.response?.status
        const detail = e.response?.data?.detail
        if (status === 400) {
            errorMsg.value = 'Este usuario ya pertenece al proyecto'
        } else if (status === 404) {
            errorMsg.value = 'No se encontró un usuario con ese email'
        } else {
            errorMsg.value = typeof detail === 'string' ? detail : 'Error al agregar el usuario'
        }
    } finally {
        agregando.value = false
    }
}

onMounted(() => store.cargarUsuarios(proyectoId.value))
</script>

<template>
  <AppLayout>
    <Toast position="top-right" />

    <!-- Encabezado -->
    <div class="flex items-start justify-between mb-5">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">
          Usuarios — {{ nombreProyecto }}
        </h1>
        <p class="text-sm text-slate-500 mt-0.5">
          {{ store.usuarios.length }} usuario{{ store.usuarios.length !== 1 ? 's' : '' }} en el proyecto
        </p>
      </div>
      <Button
        label="Agregar Usuario"
        icon="pi pi-user-plus"
        @click="abrirDialog"
      />
    </div>

    <!-- Error -->
    <Message v-if="store.error" severity="error" :closable="false" class="mb-4">
      {{ store.error }}
    </Message>

    <!-- Loading -->
    <div v-if="store.loading" class="flex flex-col items-center justify-center py-24 gap-3">
      <ProgressSpinner style="width:50px;height:50px" strokeWidth="4" />
      <span class="text-sm text-slate-400">Cargando usuarios…</span>
    </div>

    <!-- Tabla -->
    <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <DataTable :value="store.usuarios">
        <template #empty>
          <div class="flex flex-col items-center py-16 text-slate-400">
            <i class="pi pi-users text-6xl mb-4 text-slate-300"></i>
            <p class="text-base font-medium text-slate-500">Sin usuarios en este proyecto</p>
            <Button
              label="Agregar usuario"
              icon="pi pi-user-plus"
              size="small"
              class="mt-4"
              @click="abrirDialog"
            />
          </div>
        </template>

        <Column header="Usuario">
          <template #body="{ data }">
            <div>
              <div class="font-medium">{{ data.nombre || '—' }}</div>
              <div class="text-sm text-gray-500">{{ data.email }}</div>
            </div>
          </template>
        </Column>

        <Column field="rol" header="Rol" style="width:10rem">
          <template #body="{ data }">
            <span
              class="px-2 py-0.5 rounded-full text-xs font-semibold"
              :style="rolStyle(data.rol)"
            >
              {{ rolLabel(data.rol) }}
            </span>
          </template>
        </Column>

        <Column field="activo" header="Estado" style="width:8rem">
          <template #body="{ data }">
            <span
              class="px-2 py-0.5 rounded-full text-xs font-semibold"
              :style="data.activo !== false
                ? 'background:#dcfce7;color:#166534'
                : 'background:#f3f4f6;color:#6b7280'"
            >
              {{ data.activo !== false ? 'Activo' : 'Inactivo' }}
            </span>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Dialog agregar usuario -->
    <Dialog
      v-model:visible="dialogVisible"
      :style="{ width: '480px' }"
      :modal="true"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <div
            class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style="background:#0f2557"
          >
            <i class="pi pi-user-plus text-white text-sm"></i>
          </div>
          <span class="text-lg font-semibold text-gray-800">Agregar Usuario al Proyecto</span>
        </div>
      </template>

      <div class="flex flex-col gap-5 p-6">
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-slate-700">
            Nombre completo <span class="text-red-500">*</span>
          </label>
          <InputText
            v-model="nuevoUsuario.nombre"
            placeholder="Ej: Juan Carlos Pérez"
            :invalid="!!errorNombre"
            fluid
          />
          <small v-if="errorNombre" class="text-red-500 text-xs">{{ errorNombre }}</small>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-slate-700">
            Email <span class="text-red-500">*</span>
          </label>
          <InputText
            v-model="nuevoUsuario.email"
            placeholder="correo@ejemplo.com"
            :invalid="!!errorEmail"
            fluid
            type="email"
          />
          <small v-if="errorEmail" class="text-red-500 text-xs">{{ errorEmail }}</small>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-slate-700">
            Rol <span class="text-red-500">*</span>
          </label>
          <Select
            v-model="nuevoUsuario.rol"
            :options="opcionesRol"
            option-label="label"
            option-value="value"
            placeholder="Seleccionar rol"
            :invalid="!!errorRol"
            fluid
          />
          <small v-if="errorRol" class="text-red-500 text-xs">{{ errorRol }}</small>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-slate-700">
            Contraseña
            <span class="text-slate-400 font-normal">(vacío = temporal123)</span>
          </label>
          <InputText
            v-model="nuevoUsuario.password"
            placeholder="Dejar vacío para usar contraseña temporal"
            fluid
            type="password"
          />
        </div>

        <Message v-if="errorMsg" severity="error" :closable="false">{{ errorMsg }}</Message>
      </div>

      <template #footer>
        <div class="flex gap-2 justify-end">
          <Button
            label="Cancelar"
            icon="pi pi-times"
            severity="secondary"
            outlined
            :disabled="agregando"
            @click="dialogVisible = false"
          />
          <Button
            label="Agregar"
            icon="pi pi-user-plus"
            :loading="agregando"
            @click="agregarUsuario"
          />
        </div>
      </template>
    </Dialog>
  </AppLayout>
</template>
