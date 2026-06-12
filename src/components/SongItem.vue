<template>
  <div
    class="text-center cursor-pointer"
    @click="$emit('play', song)"
  >
    <!-- IMAGE WRAPPER -->
    <div class="ratio ratio-1x1 overflow-hidden rounded shadow-sm position-relative">
      <img
        :src="song.cover"
        :alt="song.title"
        class="w-100 h-100 object-fit-cover transition-transform duration-300 hover-zoom"
      />

      <!-- Hover overlay -->
      <div
        class="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center opacity-0 hover-opacity"
      >
        <i class="pi pi-play text-white" style="font-size: 2rem"></i>
      </div>
    </div>

    <!-- TITLE -->
    <div class="mt-2">
      <p class="mb-0 fw-semibold small" :class="isDark ? 'text-white' : 'text-dark'">
        {{ song.title }}
      </p>

      <p class="mb-0" style="font-size: 11px;" :class="isDark ? 'text-white-50' : 'text-secondary'">
        {{ song.artist }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useThemeStore } from '../stores/index.js'

defineProps({ song: Object })
defineEmits(['play'])

const isDark = computed(() => useThemeStore().isDark)
</script>

<style scoped>
/* smooth zoom effect */
.hover-zoom {
  transition: transform 0.3s ease;
}
.hover-zoom:hover {
  transform: scale(1.08);
}

/* overlay fade */
.hover-opacity {
  transition: opacity 0.2s ease;
}
.ratio:hover .hover-opacity {
  opacity: 1 !important;
}
</style>