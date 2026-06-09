<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectsStore } from '../stores/projects'
import { useToast } from 'primevue/usetoast'
import AppLayout from '../components/AppLayout.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Message from 'primevue/message'
import Toast from 'primevue/toast'
import ProgressSpinner from 'primevue/progressspinner'

const router   = useRouter()
const store    = useProjectsStore()
const toast    = useToast()

const dialogVisible = ref(false)
const nombre        = ref('')
const descripcion   = ref('')
const errorNombre   = ref('')
const creando       = ref(false)
const errorMsg      = ref('')

function abrirDialog() {
    nombre.value      = ''
    descripcion.value = ''
    errorNombre.value = ''
    errorMsg.value    = ''
    dialogVisible.value = true
}

async function crearProyecto() {
    errorNombre.value = ''
    errorMsg.value    = ''
    if (!nombre.value.trim()) {
        errorNombre.value = 'El nombre es obligatorio'
        return
    }
    creando.value = true
    try {
        await store.crearProyecto({
            nombre:      nombre.value.trim(),
            descripcion: descripcion.value.trim() || null,
        })
        dialogVisible.value = false
        toast.add({ severity: 'success', summary: 'Proyecto creado', detail: nombre.value.trim(), life: 3000 })
    } catch (e) {
        const detail = e.response?.data?.detail
        errorMsg.value = typeof detail === 'string' ? detail : 'Error al crear el proyecto'
    } finally {
        creando.value = false
    }
}

onMounted(() => store.cargarProyectos())
</script>

<template>
  <AppLayout>
    <Toast position="top-right" />

    <!-- Encabezado -->
    <div class="flex items-start justify-between mb-5">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Proyectos</h1>
        <p class="text-sm text-slate-500 mt-0.5">Gestión de proyectos del sistema</p>
      </div>
      <Button
        label="Nuevo Proyecto"
        icon="pi pi-plus"
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
      <span class="text-sm text-slate-400">Cargando proyectos…</span>
    </div>

    <!-- Tabla -->
    <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <DataTable :value="store.proyectos">
        <template #empty>
          <div class="flex flex-col items-center py-16 text-slate-400">
            <i class="pi pi-sitemap text-6xl mb-4 text-slate-300"></i>
            <p class="text-base font-medium text-slate-500">No hay proyectos</p>
            <Button
              label="Crear primer proyecto"
              icon="pi pi-plus"
              size="small"
              class="mt-4"
              @click="abrirDialog"
            />
          </div>
        </template>

        <Column field="id" header="#" style="width:4rem;color:#64748b;font-size:0.8rem" />

        <Column field="nombre" header="Nombre">
          <template #body="{ data }">
            <span class="font-medium text-slate-800">{{ data.nombre }}</span>
          </template>
        </Column>

        <Column field="descripcion" header="Descripción">
          <template #body="{ data }">
            <span class="text-sm text-slate-500">{{ data.descripcion || '—' }}</span>
          </template>
        </Column>

        <Column field="estado" header="Estado" style="width:8rem">
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

        <Column header="Acciones" style="width:16rem">
          <template #body="{ data }">
            <div class="flex gap-1">
              <Button
                label="Usuarios"
                icon="pi pi-users"
                size="small"
                text
                @click="router.push(`/proyectos/${data.id}/usuarios`)"
              />
              <Button
                label="Configurar"
                icon="pi pi-cog"
                size="small"
                text
                severity="secondary"
                @click="router.push(`/configuracion/proyecto/${data.id}`)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Dialog nuevo proyecto -->
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
            <i class="pi pi-sitemap text-white text-sm"></i>
          </div>
          <span class="text-lg font-semibold text-gray-800">Nuevo Proyecto</span>
        </div>
      </template>

      <div class="flex flex-col gap-5 p-6">
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-slate-700">
            Nombre <span class="text-red-500">*</span>
          </label>
          <InputText
            v-model="nombre"
            placeholder="Nombre del proyecto"
            :invalid="!!errorNombre"
            fluid
            @keyup.enter="crearProyecto"
          />
          <small v-if="errorNombre" class="text-red-500 text-xs">{{ errorNombre }}</small>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-slate-700">Descripción</label>
          <Textarea
            v-model="descripcion"
            placeholder="Descripción opcional del proyecto"
            :rows="3"
            fluid
            :auto-resize="false"
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
            :disabled="creando"
            @click="dialogVisible = false"
          />
          <Button
            label="Crear"
            icon="pi pi-check"
            :loading="creando"
            @click="crearProyecto"
          />
        </div>
      </template>
    </Dialog>
  </AppLayout>
</template>
