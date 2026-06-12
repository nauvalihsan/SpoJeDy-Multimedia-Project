<template>
  <nav
    class="position-fixed top-0 start-0 end-0 d-flex justify-content-between align-items-center px-3"
    style="height: 48px; background: #39084D; z-index: 1050;"
  >
    <!-- Brand -->
    <span
      class="text-white fw-bold fs-6 cursor-pointer"
      @click="$router.push('/')"
      style="letter-spacing: 0.5px;"
    >
      SpoJedy
    </span>

    <!-- Links -->
    <div class="d-flex gap-4 align-items-center">
      <router-link
        to="/"
        class="text-decoration-none small"
        :class="[$route.path === '/' ? 'text-white' : 'text-white-50']"
      >
        Home
      </router-link>

      <router-link
        to="/video"
        class="text-decoration-none small"
        :class="[$route.path.startsWith('/video') ? 'text-white' : 'text-white-50']"
      >
        Music Video
      </router-link>
    </div>

    <!-- Profile -->
    <div
      class="d-flex align-items-center gap-2 cursor-pointer"
      @click="$router.push('/profile')"
    >
      <!-- Avatar -->
      <div
        class="rounded-circle overflow-hidden d-flex justify-content-center align-items-center bg-secondary"
        style="width: 28px; height: 28px;"
      >
        <img
          v-if="profileImage"
          :src="profileImage"
          class="w-100 h-100 object-fit-cover"
        />
        <span v-else class="text-white small fw-bold">
          {{ username.charAt(0).toUpperCase() }}
        </span>
      </div>

      <span class="text-white small fw-medium">
        {{ username }}
      </span>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useThemeStore, useProfileStore } from '../stores/index.js'

const themeStore = useThemeStore()
const profileStore = useProfileStore()

const isDark = computed(() => themeStore.isDark)
const username = computed(() => profileStore.username)
const profileImage = computed(() => profileStore.profileImage)
</script>