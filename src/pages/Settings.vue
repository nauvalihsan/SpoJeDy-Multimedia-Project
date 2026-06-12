<template>
  <div
    class="min-h-screen pt-12 pb-14 px-8"
    :class="isDark ? 'bg-[#000000] text-white' : 'bg-[#FFFFFF] text-black'"
  >
    <div class="max-w-lg mx-auto pt-8">
      <!-- Avatar with edit overlay -->
      <div class="flex items-center gap-4 mb-4">
        <div
          class="relative w-16 h-16 rounded-full overflow-hidden bg-gray-500 cursor-pointer group"
          @click="triggerFileInput"
        >
          <!-- Loading spinner -->
          <div
            v-if="imageLoading"
            class="absolute inset-0 bg-black/60 flex items-center justify-center z-10"
          >
            <i class="pi pi-spin pi-spinner text-white" style="font-size:1.5rem"></i>
          </div>

          <img
            v-else-if="previewImage"
            :src="previewImage"
            class="w-full h-full object-cover"
            alt="profile"
          />
          <span
            v-else
            class="w-full h-full flex items-center justify-center text-2xl font-bold text-white"
          >
            {{ localUsername.charAt(0).toUpperCase() }}
          </span>

          <!-- Pencil overlay on Profile Image-->
          <div
            class="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity"
          >
            <i class="pi pi-pencil text-white" style="font-size:1rem"></i>
          </div>
        </div>
        <p class="text-xl font-bold">{{ localUsername || 'Guest' }}</p>
      </div>

      <!-- Hidden file input -->
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleImageUpload"
      />

      <!-- Divider -->
      <div class="border-b mb-6" :class="isDark ? 'border-white/20' : 'border-black/20'"></div>

      <!-- Username Field -->
      <div class="mb-5">
        <label class="block font-bold mb-2">Username</label>
        <input
          v-model="localUsername"
          type="text"
          placeholder="Enter your name"
          class="w-80 px-4 py-2 rounded-lg text-sm outline-none transition-colors"
          :class="isDark
            ? 'bg-[#4D4D4D] text-white placeholder-white/40 focus:ring-1 focus:ring-[#AE00FF]'
            : 'bg-[#D9D9D9] text-black placeholder-black/40 focus:ring-1 focus:ring-[#AE00FF]'"
        />
      </div>

      <!-- Theme Dropdown -->
      <div class="mb-8">
        <label class="block font-bold mb-2">Theme</label>
        <div class="relative w-32">
          <select
            v-model="localTheme"
            class="w-full px-4 py-2 rounded-full text-sm appearance-none cursor-pointer outline-none transition-colors"
            :class="isDark
              ? 'bg-[#4D4D4D] text-white focus:ring-1 focus:ring-[#AE00FF]'
              : 'bg-[#D9D9D9] text-black focus:ring-1 focus:ring-[#AE00FF]'"
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
          <i
            class="pi pi-chevron-up absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            :class="isDark ? 'text-white/60' : 'text-black/60'"
            style="font-size:0.75rem"
          ></i>
        </div>
      </div>

      <!-- Save Button -->
      <button
        @click="saveSettings"
        class="px-6 py-2 rounded-lg font-bold text-sm transition-colors"
        :class="isDark
          ? 'bg-white text-black hover:bg-[#AE00FF] hover:text-white'
          : 'bg-black text-white hover:bg-[#AE00FF]'"
      >Save</button>

      <!-- Success message -->
      <transition name="fade">
        <p v-if="saved" class="mt-3 text-[#AE00FF] text-sm font-medium">
          <i class="pi pi-check mr-1"></i>Saved!
        </p>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useThemeStore, useProfileStore } from '../stores/index.js'

const themeStore = useThemeStore()
const profileStore = useProfileStore()

const isDark = computed(() => themeStore.isDark)
const fileInput = ref(null)
const imageLoading = ref(false)
const saved = ref(false)

const localUsername = ref(profileStore.username)
const localTheme = ref(isDark.value ? 'dark' : 'light')
const previewImage = ref(profileStore.profileImage)

watch(() => profileStore.username, v => localUsername.value = v)

function triggerFileInput() {
  fileInput.value?.click()
}

async function handleImageUpload(e) {
  const file = e.target.files[0]
  if (!file) return

  imageLoading.value = true

  // Compress to max 1MB using Canvas
  const reader = new FileReader()
  reader.onload = (ev) => {
    const img = new Image()
    img.onload = () => {
      // Compress via canvas
      const canvas = document.createElement('canvas')
      let { width, height } = img
      const MAX = 800
      if (width > MAX || height > MAX) {
        if (width > height) { height = (height / width) * MAX; width = MAX }
        else { width = (width / height) * MAX; height = MAX }
      }
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      // Try quality 0.8, reduce if > 1MB
      let quality = 0.8
      let dataUrl = canvas.toDataURL('image/jpeg', quality)
      while (dataUrl.length > 1_048_576 && quality > 0.2) {
        quality -= 0.1
        dataUrl = canvas.toDataURL('image/jpeg', quality)
      }

      setTimeout(() => {
        previewImage.value = dataUrl
        imageLoading.value = false
      }, 600) // simulate loading animation
    }
    img.src = ev.target.result
  }
  reader.readAsDataURL(file)
}

function saveSettings() {
  // Apply theme
  themeStore.setTheme(localTheme.value === 'dark')
  // Save profile
  profileStore.saveProfile(localUsername.value, previewImage.value)

  saved.value = true
  setTimeout(() => saved.value = false, 2000)
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
