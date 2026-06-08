<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-6">
    <div class="text-center max-w-md">

      <!-- Numero 404 animado -->
      <div class="relative mb-8">
        <div class="text-9xl font-black text-gray-100 select-none leading-none">
          404
        </div>
        <div class="absolute inset-0 flex items-center justify-center">
          <img src="@/assets/icon-reqflow.png" alt="ReqFlow" class="h-20 w-20 opacity-80" />
        </div>
      </div>

      <!-- Mensaje -->
      <h1 class="text-2xl font-bold text-gray-800 mb-3">
        Página no encontrada
      </h1>
      <p class="text-gray-500 mb-8 leading-relaxed">
        La página que buscas no existe o fue movida.
        Verifica la URL o regresa al dashboard.
      </p>

      <!-- Botones -->
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          @click="$router.back()"
          class="px-6 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600
                 font-medium hover:bg-gray-100 transition-colors"
        >
          ← Volver
        </button>
        <button
          @click="$router.push('/dashboard')"
          class="px-6 py-2.5 rounded-xl font-medium text-white transition-opacity hover:opacity-90"
          style="background: linear-gradient(135deg, #0f2557, #3b82f6)"
        >
          Ir al Dashboard
        </button>
      </div>

      <!-- Footer de marca -->
      <p class="text-xs text-gray-400 mt-12">
        ReqFlow v1.0 — Gestión de requerimientos
      </p>

    </div>
  </div>
</template>
