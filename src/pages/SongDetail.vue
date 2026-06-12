<template>
  <div
    class="min-h-screen pt-12 pb-14 flex items-center justify-center relative overflow-hidden"
    :class="isDark ? 'bg-[#000000]' : 'bg-[#FFFFFF]'"
  >
    <!-- Blurred background from album art -->
    <div
      class="absolute inset-0 scale-110"
      :style="{
        backgroundImage: song ? `url(${song.cover})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(40px)',
        opacity: isDark ? 0.4 : 0.3
      }"
    ></div>

    <!-- Back button -->
    <button
    :class="[
      'absolute top-16 left-6 hover:text-[#AE00FF] transition-colors z-10',
      isDark ? 'icon-theme-dark' : 'icon-theme-light'
    ]"
      @click="$router.back()"
    >
      <i class="pi pi-arrow-left" style="font-size:1.2rem"></i>
    </button>

    <!-- Player Card -->
    <div class="relative z-10 flex flex-col items-center w-[400px] translate-y-4">
      <!-- Album Art - click for fullscreen -->
      <div
        class="w-[400px] h-[400px] rounded-2xl overflow-hidden shadow-2xl cursor-pointer mb-5"
        @click="openFullscreen"
      >
        <img
          v-if="song"
          :src="song.cover"
          :alt="song.title"
          class="w-full h-full object-cover"
        />
      </div>

      <!-- Title & Artist -->
      <div class="w-full text-center mb-2">
        <p class="font-bold text-base leading-tight"
        :class="isDark ? 'text-white' : 'text-black'">{{ song?.title }}</p>

        <p class="text-sm"
        :class="isDark ? 'icon-theme-dark' : 'icon-theme-light'">{{ song?.artist }} - {{ song?.album }}</p>
      </div>

      <!-- Duration Bar -->
      <div class="w-[460px] flex items-center gap-1 mb-4">
        <span :class="['text-[10px] w-10 shrink-0 text-right mr-2', isDark ? 'icon-theme-dark' : 'icon-theme-light']">
          {{ formatTime(localTime) }}
        </span>
        <div
          class="flex-1 relative h-1 group cursor-pointer"
          @click="seekFromBar"
          @mousedown="startSeekDrag"
        >
          <!-- Dynamic width bar -->
          <div class="absolute inset-0 rounded-full bg-white/30"></div>
          <div
            class="absolute left-0 top-0 h-full rounded-full bg-[#AE00FF] transition-all duration-100"
            :style="{ width: progressPercent + '%' }"
          ></div>
          <div
            class="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#AE00FF] -ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
            :style="{ left: progressPercent + '%' }"
          ></div>
        </div>
        <span :class="['text-[10px] w-10 shrink-0 text-left ml-2', isDark ? 'icon-theme-dark' : 'icon-theme-light']">
          {{ formatTime(localDuration) }}
        </span>
      </div>

      <!-- Playback Controls -->
      <div class="flex items-center justify-center gap-8 mb-3 relative w-full">
        <button @click="prevTrack" :class="['hover:text-[#AE00FF] transition-colors', 
        isDark ? 'icon-theme-dark' : 'icon-theme-light']">

          <i class="pi pi-step-backward" style="font-size:1.3rem"></i>
        </button>
        <button
          @click="togglePlay"
          :class="['w-12 h-12 rounded-full bg-black/20 hover:bg-[#AE00FF]/30 flex items-center justify-center transition-colors', 
          isDark ? 'icon-theme-dark' : 'icon-theme-light']"
        >
          <i :class="isPlaying ? 'pi pi-pause' : 'pi pi-play'" style="font-size:1.4rem"></i>
        </button>
        <button @click="nextTrack" :class="['hover:text-[#AE00FF] transition-colors',
        isDark ? 'icon-theme-dark' : 'icon-theme-light']">

          <i class="pi pi-step-forward" style="font-size:1.3rem"></i>
        </button>
      </div>

      <!-- Volume Bar -->
      <div class="w-[400px] flex items-center gap-2 mb-5">
        <i :class="['pi pi-volume-down shrink-0',
        isDark ? 'icon-theme-dark' : 'icon-theme-light']" 
        style="font-size:0.9rem"></i>

        <div
          ref="volumeBar"
          class="flex-1 relative h-1 group cursor-pointer"
          @click="seekVolume"
          @mousedown="startVolumeDrag"
        >
          <div class="absolute inset-0 rounded-full bg-white/30"></div>
          <div
            class="absolute left-0 top-0 h-full rounded-full bg-[#AE00FF]"
            :style="{ width: (volume * 100) + '%' }"
          ></div>
          <div
            class="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#AE00FF] -ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
            :style="{ left: (volume * 100) + '%' }"
          ></div>
        </div>
        <i :class="['pi pi-volume-up shrink-0',
        isDark ? 'icon-theme-dark' : 'icon-theme-light']" 
        style="font-size:0.9rem"></i>
      </div>

      <!-- Switch to Video -->
      <button
        v-if="song?.video"
        @click="switchToVideo"
        :class="['flex items-center gap-2 px-4 py-2 rounded-full text-white text-xs hover:text-[#AE00FF] transition-colors backdrop-blur-md', 
          isDark ? 'icon-theme-dark' : 'icon-theme-light'

        ]"
        style="background: rgba(217,217,217,0.2); backdrop-filter: blur(8px);"
      >
        Switch to Video
        <i class="pi pi-video" style="font-size:0.8rem"></i>
      </button>
    </div>

    <!-- Fullscreen Image Modal -->
    <div
      v-if="isFullscreen"
      class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      @click.self="closeFullscreen"
      @wheel="handleZoom"
    >
      <div class="relative">
        <img
          :src="song?.cover"
          class="max-w-[90vw] max-h-[90vh] object-contain rounded-lg transition-transform duration-200"
          :style="{ transform: `scale(${zoomLevel})` }"
          alt="cover fullscreen"
        />
      </div>
      <button
        class="absolute top-4 right-4 text-white/80 hover:text-[#AE00FF] transition-colors"
        @click="closeFullscreen"
      >
        <i class="pi pi-times" style="font-size:1.5rem"></i>
      </button>
      <div class="absolute bottom-6 flex gap-4">
        <button
          @click="zoomLevel = Math.max(0.5, zoomLevel - 0.25)"
          class="bg-white/20 hover:bg-[#AE00FF]/30 text-white px-3 py-1.5 rounded-full text-sm transition-colors"
        >
          <i class="pi pi-search-minus"></i>
        </button>
        <button
          @click="zoomLevel = 1"
          class="bg-white/20 hover:bg-[#AE00FF]/30 text-white px-3 py-1.5 rounded-full text-sm transition-colors"
        >Reset</button>
        <button
          @click="zoomLevel = Math.min(4, zoomLevel + 0.25)"
          class="bg-white/20 hover:bg-[#AE00FF]/30 text-white px-3 py-1.5 rounded-full text-sm transition-colors"
        >
          <i class="pi pi-search-plus"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { songs } from '../data/Data.js'
import { useThemeStore, usePlayerStore } from '../stores/index.js'

const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()
const playerStore = usePlayerStore()
const isDark = computed(() => themeStore.isDark)
const localTime = computed(() => playerStore.currentTime)
const localDuration = computed(() => playerStore.duration)
const isFullscreen = ref(false)
const zoomLevel = ref(1)
const song = computed(() => playerStore.currentSong)
const isPlaying = computed(() => playerStore.isPlaying)
const volume = computed(() => playerStore.volume)

const volumeBar = ref(null)
const isDraggingVolume = ref(false)

const progressPercent = computed(() => {
  if (!localDuration.value) return 0
  return (localTime.value / localDuration.value) * 100
})

// On mount, load song into store if not already
onMounted(() => {
  if (
    song.value &&
    (!playerStore.currentSong ||
      playerStore.currentSong.id !== song.value.id)
  ) {
    playerStore.playSong(song.value, 'audio')
  }
})

watch(
  () => playerStore.currentSong,
  (newSong) => {
    if (newSong && route.params.id != newSong.id) {
      router.replace(`/song/${newSong.id}`)
    }
  }
)

function onTimeUpdate() {
  localTime.value = audioEl.value.currentTime
  playerStore.updateTime(audioEl.value.currentTime)
}

function onLoadedMetadata() {
  localDuration.value = audioEl.value.duration
  playerStore.updateDuration(audioEl.value.duration)
}

function onEnded() {
  playerStore.nextTrack()

  setTimeout(() => {
    if (playerStore.currentSong) {
      router.replace(`/song/${playerStore.currentSong.id}`)
    }
  }, 100)
}

function togglePlay() {
  playerStore.togglePlay()
}

function prevTrack() {
  playerStore.prevTrack()
  setTimeout(() => {
    if (playerStore.currentSong) {
      router.replace(`/song/${playerStore.currentSong.id}`)
    }
  }, 100)
}

function nextTrack() {
  playerStore.nextTrack()
  setTimeout(() => {
    if (playerStore.currentSong) {
      router.replace(`/song/${playerStore.currentSong.id}`)
    }
  }, 100)
}

function seekFromBar(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  const t = ratio * localDuration.value

  playerStore.seek(t)
}

function startSeekDrag(e) {
  const bar = e.currentTarget

  const move = (ev) => {
    const rect = bar.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width))
    const t = ratio * localDuration.value
    playerStore.seek(t)
  }

  const up = () => {
    document.removeEventListener('mousemove', move)
    document.removeEventListener('mouseup', up)
  }

  document.addEventListener('mousemove', move)
  document.addEventListener('mouseup', up)
}

function setVolumeFromEvent(e) {
  const rect = volumeBar.value.getBoundingClientRect()

  const ratio = Math.max(
    0,
    Math.min(1, (e.clientX - rect.left) / rect.width)
  )

  playerStore.setVolume(ratio)
}

let dragged = false

function seekVolume(e) {
  if (dragged) return
  setVolumeFromEvent(e)
}

function startVolumeDrag(e) {
  dragged = false

  setVolumeFromEvent(e)

  const move = (ev) => {
    dragged = true
    setVolumeFromEvent(ev)
  }

  const up = () => {
    setTimeout(() => {
      dragged = false
    }, 50)

    document.removeEventListener('mousemove', move)
    document.removeEventListener('mouseup', up)
  }

  document.addEventListener('mousemove', move)
  document.addEventListener('mouseup', up)
}

function formatTime(s) {
  if (!s || isNaN(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60).toString().padStart(2, '0')
  return `${m}:${sec}`
}

function openFullscreen() {
  isFullscreen.value = true
  zoomLevel.value = 1
}
function closeFullscreen() {
  isFullscreen.value = false
}
function handleZoom(e) {
  e.preventDefault()
  zoomLevel.value = Math.max(0.5, Math.min(4, zoomLevel.value - e.deltaY * 0.001))
}

function switchToVideo() {
  // Reset: video starts from beginning
  playerStore.playSong(song.value, 'video')
  router.push(`/video/${song.value.id}`)
}
</script>
