<template>
  <div class="relative">
    <i
      class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-xs"
      :class="isDark ? 'text-white/60' : 'text-black/50'"
    ></i>
    <input
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      type="text"
      placeholder="Search Song"
      class="w-full pl-8 pr-3 py-1.5 text-xs rounded-[28px] outline-none transition-colors"
      :class="isDark
        ? 'bg-[#212121] text-white placeholder-white/40 border border-transparent focus:border-[#AE00FF]'
        : 'bg-[#D9D9D9]/60 text-black placeholder-black/40 border border-transparent focus:border-[#AE00FF]'"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useThemeStore } from '../stores/index.js'

defineProps({ modelValue: String })
defineEmits(['update:modelValue'])

const isDark = computed(() => useThemeStore().isDark)
</script>
