<template>
  <div
    class="min-h-screen pt-12 pb-14 flex relative overflow-hidden"
    :class="isDark ? 'bg-[#000000] text-white' : 'bg-[#FFFFFF] text-black'"
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
        :class="isDark ? 'text-white' : 'text-black'">Library</p>

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
            class="
            w-14 h-14
            rounded-lg
            overflow-hidden
            shrink-0
            bg-gray-500
            "
          >
            <img
              :src="pl.cover"
              class="w-full h-full object-cover"
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
    <main class="ml-[250px] flex-1 px-8 pt-6 relative overflow-hidden">
      <div v-if="currentPlaylist" class="flex items-start gap-6 mb-6">
        <!-- Playlist Cover -->
        <div class="w-32 h-32 rounded-lg overflow-hidden shrink-0 bg-gray-600">
          <img :src="currentPlaylist.cover" class="w-full h-full object-cover" :alt="currentPlaylist.name" />
        </div>
        <div>
          <h1 class="text-4xl font-black">{{ currentPlaylist.name }}</h1>
          <p class="text-sm opacity-60 mt-1">{{ playlistSongs.length }} songs</p>
        </div>
      </div>

      <!-- Divider -->
      <div class="border-b mb-4" :class="isDark ? 'border-white/20' : 'border-black/20'"></div>

      <!-- Song List -->
      <div class="flex flex-col gap-2">
        <div
          v-for="(song, idx) in filteredPlaylistSongs"
          :key="song.id"
          class="flex items-center gap-4 px-3 py-2 rounded-lg cursor-pointer transition-colors group"
          :class="[
            isDark
              ? 'hover:bg-white/5'
              : 'hover:bg-black/5',
            playerStore.currentSong?.id === song.id ? (isDark ? 'bg-[#AE00FF]/10' : 'bg-[#AE00FF]/10') : ''
          ]"
          @click="playSong(song)"
        >
          <span class="w-5 text-xs text-center opacity-50">
            <i v-if="playerStore.currentSong?.id === song.id && playerStore.isPlaying" class="pi pi-volume-up text-[#AE00FF]" style="font-size:0.75rem"></i>
            <span v-else>{{ idx + 1 }}</span>
          </span>
          <div class="w-10 h-10 rounded overflow-hidden shrink-0">
            <img :src="song.cover" class="w-full h-full object-cover" :alt="song.title" />
          </div>
          <div class="flex-1 min-w-0">
            <p
              class="text-sm font-semibold truncate"
              :class="playerStore.currentSong?.id === song.id ? 'text-[#AE00FF]' : ''"
            >{{ song.title }}</p>
            <p class="text-xs opacity-60 truncate">{{ song.artist }}</p>
          </div>
          <span class="text-xs opacity-50">{{ song.album }}</span>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { songs, playlists } from '../data/Data.js'
import { useThemeStore, usePlayerStore } from '../stores/index.js'
import SearchBar from '../components/SearchBar.vue'

const bgDark = 'https://ik.imagekit.io/nauvalihsan/SpoJeDy%20Assets/Background%20-%20Dark.png?updatedAt=1779530863666'
const bgLight = 'https://ik.imagekit.io/nauvalihsan/SpoJeDy%20Assets/Background%20-%20Light.png'


const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()
const playerStore = usePlayerStore()

const isDark = computed(() => themeStore.isDark)
const searchQuery = ref('')

const currentPlaylist = computed(() => playlists.find(p => p.id === route.params.id))
const playlistSongs = computed(() => {
  if (!currentPlaylist.value) return []
  return currentPlaylist.value.songIds.map(id => songs.find(s => s.id === id)).filter(Boolean)
})

const filteredPlaylistSongs = computed(() => {
  if (!searchQuery.value) return playlistSongs.value
  return playlistSongs.value.filter(s =>
    s.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    s.artist.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

function playSong(song) {
  playerStore.playSong(song, 'audio')
  router.push(`/song/${song.id}`)
}
</script>
