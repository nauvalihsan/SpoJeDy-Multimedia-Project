<template>
  <div
    class="flex flex-col cursor-pointer group"
    @click="$emit('play', song)"
  >
    <!-- Video thumbnail (16:9 ratio) -->
    <div class="relative w-full overflow-hidden rounded-md" style="aspect-ratio: 16/9;">
      <video
        :src="song.video"
        :poster="song.cover"
        class="w-full h-full object-cover"
        preload="metadata"
        muted
      />
      <!-- Play overlay on hover -->
      <div
        class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      >
        <i class="pi pi-play text-white" style="font-size:2.5rem"></i>
      </div>
    </div>
    <p
      class="mt-2 text-xs font-semibold text-center leading-tight"
      :class="isDark ? 'text-white' : 'text-black'"
    >{{ song.title }}</p>
    <p
      class="text-[11px] text-center"
      :class="isDark ? 'text-white/60' : 'text-black/60'"
    >{{ song.artist }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useThemeStore } from '../stores/index.js'

defineProps({ song: Object })
defineEmits(['play'])

const isDark = computed(() => useThemeStore().isDark)
</script>
