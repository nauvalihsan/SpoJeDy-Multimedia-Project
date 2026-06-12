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
    <div class="flex gap-6 p-6 max-w-6xl mx-auto">
      <!-- Video Player Section -->
      <div class="flex-1 min-w-0">
        <!-- Video Player -->
        <div class="relative w-full rounded-lg overflow-hidden bg-black" style="aspect-ratio: 16/9;">
          <video
            autoplay
            ref="videoEl"
            :src="song?.video"
            class="w-full h-full"
            @timeupdate="onTimeUpdate"
            @loadedmetadata="onLoadedMetadata"
            @ended="onEnded"
            @click="togglePlay"
          />

          <!-- Controls Overlay -->
          <div
            class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-8"
          >
            <!-- Progress Bar -->
            <div
              class="w-full h-1 group cursor-pointer mb-2"
              @click="seekFromBar"
              @mousedown="startSeekDrag"
            >
              <div class="relative h-full rounded-full bg-white/30">
                <div
                  class="absolute left-0 top-0 h-full rounded-full bg-[#AE00FF]"
                  :style="{ width: videoProgressPercent + '%' }"
                ></div>
                <div
                  class="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#AE00FF] -ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  :style="{ left: videoProgressPercent + '%' }"
                ></div>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <button @click="prevVideo" class="text-white hover:text-[#AE00FF] transition-colors">
                <i class="pi pi-step-backward" style="font-size:1.2rem"></i>
              </button>
              <button @click="togglePlay" class="text-white hover:text-[#AE00FF] transition-colors">
                <i :class="videoPlaying ? 'pi pi-pause' : 'pi pi-play'" style="font-size:1.2rem"></i>
              </button>
              <button @click="nextVideo" class="text-white hover:text-[#AE00FF] transition-colors">
                <i class="pi pi-step-forward" style="font-size:1.2rem"></i>
              </button>
              <span class="text-white/70 text-xs">{{ formatTime(videoTime) }} / {{ formatTime(videoDuration) }}</span>

              <!-- Volume -->
              <div class="flex items-center gap-2 ml-auto">
                <i class="pi pi-volume-down text-white/60" style="font-size:0.9rem"></i>
                <div class="relative w-20 h-1 group cursor-pointer" 
                @click="seekVolume" @mousedown="startVolumeDrag"
                >
                  <div class="absolute inset-0 rounded-full bg-white/30"></div>
                  <div
                    class="absolute left-0 top-0 h-full rounded-full bg-[#AE00FF]"
                    :style="{ width: (videoVolume * 100) + '%' }"
                  ></div>
                  <div
                    class="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#AE00FF] -ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    :style="{ left: (videoVolume * 100) + '%' }"
                  ></div>
                </div>
                <i class="pi pi-volume-up text-white/60" style="font-size:0.9rem"></i>
              </div>


              <!-- Fullscreen button -->
              <button @click="toggleFullscreen" class="text-white/80 hover:text-[#AE00FF] transition-colors">
                <i class="pi pi-window-maximize" style="font-size:1rem"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Song Info -->
        <div class="mt-3 flex items-start justify-between">
          <div>
            <p class="font-bold text-base">{{ song?.title }}</p>
            <p class="text-sm opacity-70">{{ song?.artist }} - {{ song?.album }}</p>
          </div>
        </div>

        <!-- Switch to Audio -->
        <button
          @click="switchToAudio"
          class="mt-3 flex items-center gap-2 px-4 py-2 rounded-full text-sm hover:text-[#AE00FF] transition-colors"
          style="background: rgba(217,217,217,0.2); backdrop-filter: blur(8px);"
        >
          Switch to Audio
          <i class="pi pi-headphones" style="font-size:0.8rem"></i>
        </button>
      </div>

      <!-- Explore Sidebar -->
      <div
        class="w-72 shrink-0 rounded-lg overflow-hidden"
        :class="isDark ? 'bg-[#212121]' : 'bg-[#F5F5F5]'"
      >
        <p class="px-4 py-3 font-bold text-sm border-b" :class="isDark ? 'border-white/10' : 'border-black/10'">
          Explore
        </p>
        <div class="flex flex-col gap-0">
          <div
            v-for="s in exploreVideos"
            :key="s.id"
            class="flex gap-3 p-3 cursor-pointer hover:bg-[#AE00FF]/10 transition-colors"
            @click="navigateTo(s)"
          >
            <div class="w-20 h-14 rounded overflow-hidden shrink-0 bg-gray-600">
              <video :src="s.video" :poster="s.cover" class="w-full h-full object-cover" preload="metadata" muted />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-semibold truncate">{{ s.title }}</p>
              <p class="text-xs opacity-60 truncate">{{ s.artist }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { songs } from '../data/Data.js'
import { useThemeStore, usePlayerStore } from '../stores/index.js'

const bgDark = 'https://ik.imagekit.io/nauvalihsan/SpoJeDy%20Assets/Background%20-%20Dark.png?updatedAt=1779530863666'
const bgLight = 'https://ik.imagekit.io/nauvalihsan/SpoJeDy%20Assets/Background%20-%20Light.png'

const isSeeking = ref(false)
const isVolumeDragging = ref(false)

const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()
const playerStore = usePlayerStore()

const isDark = computed(() => themeStore.isDark)
const videoEl = ref(null)
const videoPlaying = ref(false)
const videoTime = ref(0)
const videoDuration = ref(0)
const videoVolume = ref(1)



const song = computed(() => songs.find(s => s.id === parseInt(route.params.id)))

// Explore: all songs except current, shuffled
const exploreVideos = computed(() => {
  const others = songs.filter(s => s.id !== song.value?.id)
  // Shuffle
  return [...others].sort(() => Math.random() - 0.5).slice(0, 6)
})

const videoProgressPercent = computed(() => {
  if (!videoDuration.value) return 0
  return (videoTime.value / videoDuration.value) * 100
})

onMounted(async () => {
  if (videoEl.value) {
    videoEl.value.volume = videoVolume.value

    await videoEl.value.play().catch(() => {})

    videoPlaying.value = true
  }
})

watch(() => route.params.id, async () => {
  videoTime.value = 0
  videoDuration.value = 0

  if (videoEl.value) {
    videoEl.value.load()

    await videoEl.value.play().catch(() => {})

    videoPlaying.value = true
  }
})

function togglePlay() {
  if (!videoEl.value) return
  if (videoPlaying.value) {
    videoEl.value.pause()
    videoPlaying.value = false
  } else {
    videoEl.value.play().catch(() => {})
    videoPlaying.value = true
  }
}

function onTimeUpdate() {
  videoTime.value = videoEl.value.currentTime
}

function onLoadedMetadata() {
  videoDuration.value = videoEl.value.duration
}

function onEnded() {
  videoPlaying.value = false
  nextVideo()
}

function seekFromBar(e) {
  updateSeek(e, e.currentTarget)
}

function updateSeek(e, bar) {
  const rect = bar.getBoundingClientRect()

  const ratio = Math.max(
    0,
    Math.min(1, (e.clientX - rect.left) / rect.width)
  )

  const t = ratio * videoDuration.value

  videoTime.value = t

  if (videoEl.value) {
    videoEl.value.currentTime = t
  }
}

function startSeekDrag(e) {
  isSeeking.value = true

  const bar = e.currentTarget

  updateSeek(e, bar)

  const move = (ev) => {
    updateSeek(ev, bar)
  }

  const up = () => {
    isSeeking.value = false

    document.removeEventListener('mousemove', move)
    document.removeEventListener('mouseup', up)
  }

  document.addEventListener('mousemove', move)
  document.addEventListener('mouseup', up)
}

function seekVolume(e) {
  updateVolume(e, e.currentTarget)
}

function updateVolume(e, bar) {
  const rect = bar.getBoundingClientRect()

  const ratio = Math.max(
    0,
    Math.min(1, (e.clientX - rect.left) / rect.width)
  )

  videoVolume.value = ratio

  if (videoEl.value) {
    videoEl.value.volume = ratio
  }
}

function startVolumeDrag(e) {
  isVolumeDragging.value = true

  const bar = e.currentTarget

  updateVolume(e, bar)

  const move = (ev) => {
    updateVolume(ev, bar)
  }

  const up = () => {
    isVolumeDragging.value = false

    document.removeEventListener('mousemove', move)
    document.removeEventListener('mouseup', up)
  }

  document.addEventListener('mousemove', move)
  document.addEventListener('mouseup', up)
}

function toggleFullscreen() {
  if (videoEl.value) {
    if (document.fullscreenElement) document.exitFullscreen()
    else videoEl.value.requestFullscreen().catch(() => {})
  }
}

function prevVideo() {
  const idx = songs.findIndex(s => s.id === song.value?.id)
  const prev = songs[(idx - 1 + songs.length) % songs.length]
  router.replace(`/video/${prev.id}`)
}

function nextVideo() {
  const idx = songs.findIndex(s => s.id === song.value?.id)
  const next = songs[(idx + 1) % songs.length]
  router.replace(`/video/${next.id}`)
}

async function navigateTo(s) {
  await router.replace(`/video/${s.id}`)

  setTimeout(async () => {
    if (videoEl.value) {
      videoEl.value.load()

      await videoEl.value.play().catch(() => {})

      videoPlaying.value = true
    }
  }, 100)
}

function formatTime(s) {
  if (!s || isNaN(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60).toString().padStart(2, '0')
  return `${m}:${sec}`
}

function switchToAudio() {
  // Audio starts from beginning
  playerStore.playSong(song.value, 'audio')
  router.push(`/song/${song.value.id}`)
}
</script>
