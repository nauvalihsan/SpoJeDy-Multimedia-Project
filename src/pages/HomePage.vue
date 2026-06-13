<template>
  <div
    class="min-h-screen pt-12 pb-14 flex relative overflow-hidden"
    :class="isDark ? 'text-white' : 'text-black'"
    :style="{
      backgroundImage: `url(${isDark ? bgDark : bgLight})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed'
    }"
  >
    <!-- Sidebar -->
    <aside
      class="w-[280px] shrink-0 fixed left-0 top-12 bottom-0 z-10 px-4 py-3 flex flex-col"
    >

      <!-- Search -->
      <SearchBar v-model="searchQuery" />

      <!-- Library Card -->
      <div
        class="flex-1 rounded-[28px] mt-2 p-4 overflow-hidden"
        :class="isDark ? 'bg-[#212121]/95' : 'bg-[#F5F5F5]/90'"
      >

        <!-- Title -->
        <p
          class="text-[16px] font-bold mb-5"
          :class="isDark ? 'text-white' : 'text-black'"
        >
          Library
        </p>

        <!-- Playlist -->
        <div class="flex flex-col gap-3 mt-2">

          <div
            v-for="pl in playlists"
            :key="pl.id"
            class="
            flex items-center gap-3
            cursor-pointer
            rounded-xl
            px-2 py-2
            transition-all duration-200
            hover:bg-white/5
            hover:text-[#AE00FF]
            hover:translate-x-1
            "
            @click="$router.push(`/playlist/${pl.id}`)"
          >

            <!-- Cover -->
            <div
              class="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-gray-500"
            >
              <img :src="pl.cover" class="w-full h-full object-cover"
                :alt="pl.name"
              />
            </div>

            <!-- Name -->
            <span class="text-[15px] font-medium truncate">
              {{ pl.name }}
            </span>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="ml-[250px] flex-1 px-8 pt-6 relative">
      <!-- Background texture blobs -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          class="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-60"
          :class="isDark ? 'bg-[#8B0000]' : 'bg-[#AE00FF]/30'"
        ></div>
        <div
          class="absolute top-10 right-40 w-56 h-56 rounded-full blur-3xl opacity-50"
          :class="isDark ? 'bg-[#8B4500]' : 'bg-orange-300/40'"
        ></div>
        <div
          v-if="!isDark"
          class="absolute top-0 left-8 w-48 h-48 rounded-full blur-3xl opacity-40 bg-[#AE00FF]/40"
        ></div>
      </div>

      <!-- Search Results Mode -->
      <div v-if="searchQuery" class="relative z-10">
        <p class="text-2xl font-black mb-4">Search Results</p>
        <div v-if="filteredSongs.length" class="grid grid-cols-5 gap-5">
          <SongItem
            v-for="song in filteredSongs"
            :key="song.id"
            :song="song"
            @play="playSong(song)"
          />
        </div>
        <p v-else class="text-sm opacity-60">No songs found for "{{ searchQuery }}"</p>
      </div>

      <!-- Normal Home View -->
      <div v-else class="relative z-10">
        <h1 class="text-3xl font-black mb-4">Home</h1>
        <h2 class="text-xl font-black mb-4">Recommended</h2>

        <div class="grid grid-cols-5 gap-5">
          <SongItem
            v-for="song in songs"
            :key="song.id"
            :song="song"
            @play="playSong(song)"
          />
      </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { songs, playlists } from '../data/Data.js'
import { useThemeStore, usePlayerStore } from '../stores/index.js'
import SearchBar from '../components/SearchBar.vue'
import SongItem from '../components/SongItem.vue'

const bgDark = 'https://ik.imagekit.io/nauvalihsan/SpoJeDy%20Assets/Background%20-%20Dark.png?updatedAt=1779530863666'
const bgLight = 'https://ik.imagekit.io/nauvalihsan/SpoJeDy%20Assets/Background%20-%20Light.png'

const router = useRouter()
const themeStore = useThemeStore()
const playerStore = usePlayerStore()

const isDark = computed(() => themeStore.isDark)
const searchQuery = ref('')

const filteredSongs = computed(() =>
  songs.filter(s =>
    s.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    s.artist.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
)

function playSong(song) {
  playerStore.playSong(song, 'audio')
  router.push(`/song/${song.id}`)
}
</script>
