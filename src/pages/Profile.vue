<template>
  <div
    class="min-h-screen pt-12 pb-14 px-8 relative overflow-hidden"
    :class="isDark ? 'bg-[#000000] text-white' : 'bg-[#FFFFFF] text-black'"
    :style="{
      backgroundImage: `url(${isDark ? bgDark : bgLight})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed'
    }"   
  >
    <div class="max-w-3xl mx-auto pt-8">
      <!-- Avatar + Username -->
      <div class="flex items-center gap-4 mb-4">
        <div class="w-16 h-16 rounded-full overflow-hidden bg-gray-400 shrink-0">
          <img
            v-if="profileImage"
            :src="profileImage"
            class="w-full h-full object-cover"
            alt="profile"
          />
          <span v-else class="w-full h-full flex items-center justify-center text-2xl font-bold text-white">
            {{ username.charAt(0).toUpperCase() }}
          </span>
        </div>
        <p class="text-2xl font-bold">{{ username }}</p>
        <!-- Pencil icon to settings -->
        <button
          @click="$router.push('/settings')"
          :class="['hover:text-[#AE00FF] transition-colors ml-1', isDark ? 'text-white/60' : 'text-black/60']"
          title="Edit profile"
        >
          <i class="pi pi-pencil" style="font-size:1rem"></i>
        </button>
      </div>

      <!-- Divider -->
      <div class="border-b mb-6" :class="isDark ? 'border-white/20' : 'border-black/20'"></div>

      <!-- Playlists Grid -->
      <div class="grid grid-cols-3 gap-6">
        <div
          v-for="pl in playlists"
          :key="pl.id"
          class="flex flex-col cursor-pointer group"
          @click="$router.push(`/playlist/${pl.id}`)"
        >
          <div class="w-full aspect-square rounded-lg overflow-hidden bg-gray-300 group-hover:ring-2 ring-[#AE00FF] transition-all">
            <img :src="pl.cover" class="w-full h-full object-cover" :alt="pl.name" />
          </div>
          <p class="mt-2 text-sm font-semibold text-center group-hover:text-[#AE00FF] transition-colors">
            {{ pl.name }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { playlists } from '../data/Data.js'
import { useThemeStore, useProfileStore } from '../stores/index.js'

const bgDark = 'https://ik.imagekit.io/nauvalihsan/SpoJeDy%20Assets/Background%20-%20Dark.png?updatedAt=1779530863666'
const bgLight = 'https://ik.imagekit.io/nauvalihsan/SpoJeDy%20Assets/Background%20-%20Light.png'

const themeStore = useThemeStore()
const profileStore = useProfileStore()

const isDark = computed(() => themeStore.isDark)
const username = computed(() => profileStore.username)
const profileImage = computed(() => profileStore.profileImage)
</script>
