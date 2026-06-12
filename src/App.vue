<template>
  <div :class="isDark ? 'dark' : ''">
    <NavBar />
    <RouterView />
    <PlayerControls/>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useThemeStore } from './stores/index.js'
import NavBar from './components/NavBar.vue'
import PlayerControls from './components/PlayerControls.vue'

const themeStore = useThemeStore()
const isDark = computed(() => themeStore.isDark)

watch(isDark, (v) => {
  if (v) document.documentElement.classList.add('dark')
  else document.documentElement.classList.remove('dark')
}, { immediate: true })
</script>
