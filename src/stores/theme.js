import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
    const isDark = ref(
        localStorage.getItem('reqflow-theme') === 'dark'
    )

    function toggleDark() {
        isDark.value = !isDark.value
        localStorage.setItem('reqflow-theme', isDark.value ? 'dark' : 'light')
        aplicarTema()
    }

    function aplicarTema() {
        if (isDark.value) {
            document.documentElement.classList.add('dark-mode')
        } else {
            document.documentElement.classList.remove('dark-mode')
        }
    }

    aplicarTema()

    return { isDark, toggleDark }
})
