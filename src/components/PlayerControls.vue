<!-- PlayerControls.vue - Bottom Floating Music Player -->
<template>
  <!-- Hidden audio element that persists globally -->
  <audio
    ref="audioEl"
    :src="currentSong && mediaType === 'audio' ? currentSong.audio : undefined"
    @timeupdate="onTimeUpdate"
    @loadedmetadata="onLoadedMetadata"
    @ended="onEnded"
  />

  <div
    v-if="
      currentSong &&
      !$route.path.startsWith('/song/') &&
      !$route.path.startsWith('/video/')
    "
    class="fixed bottom-3 left-[280px] right-4 z-50 h-[70px] flex items-center gap-4 px-6 rounded-full shadow-lg"
    style="background: rgba(40,40,40,0.82); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);"
  >
    <!-- Prev / Play / Next -->
    <div class="flex items-center gap-3 shrink-0">
      <button
        @click="prevTrack"
        class="w-6 h-6 flex items-center justify-center text-white/80 hover:text-[#AE00FF] transition-colors"
        title="Previous"
      >
        <i class="pi pi-step-backward text-[14px]"></i>
      </button>
      <button
        @click="handlePlayPause"
        class="w-8 h-8 flex items-center justify-center text-white/80 hover:text-[#AE00FF] transition-colors"
        title="Play/Pause"
      >
        <i :class="isPlaying ? 'pi pi-pause' : 'pi pi-play'" class="text-[16px]"></i>
      </button>
      <button
        @click="nextTrack"
        class="w-6 h-6 flex items-center justify-center text-white/80 hover:text-[#AE00FF] transition-colors"
        title="Next"
      >
        <i class="pi pi-step-forward text-[14px]"></i>
      </button>
    </div>

    <!-- Album Art -->
    <div
      class="shrink-0 rounded overflow-hidden cursor-pointer"
      :class="mediaType === 'video' ? 'w-20 h-12' : 'w-14 h-14'"
      @click="goToDetail"
    >
      <img
        :src="currentSong.cover"
        class="w-full h-full object-cover"
        alt="cover"
      />
    </div>

    <!-- Song Info + Progress Bar -->
    <div class="flex-1 min-w-0 flex flex-col justify-center gap-1">
      <span class="text-white text-xs font-medium truncate leading-tight cursor-pointer hover:text-[#AE00FF]" @click="goToDetail">
        {{ currentSong.title }}
      </span>
      <span class="text-white/60 text-[10px] truncate leading-tight">
        {{ currentSong.artist }} - {{ currentSong.album }}
      </span>

      <!-- Progress Bar -->
      <div
        class="relative w-full h-1 group mt-0.5 cursor-pointer"
        @click="seekFromBar"
        @mousedown="startDrag"
      >
        <!-- Track BG -->
        <div class="absolute inset-0 rounded-full bg-white/30"></div>
        <!-- Filled portion -->
        <div
          class="absolute left-0 top-0 h-full rounded-full bg-[#AE00FF] transition-all duration-100"
          :style="{ width: progressPercent + '%' }"
        ></div>
        <!-- Thumb on hover/drag -->
        <div
          class="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#AE00FF] -ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
          :style="{ left: progressPercent + '%' }"
        ></div>
      </div>
    </div>

    <!-- Right controls -->
    <div class="flex items-center gap-3 shrink-0">
      <!-- Shuffle -->
      <button
        @click="toggleShuffle"
        class="transition-colors"
        :class="isShuffled ? 'text-[#AE00FF]' : 'text-white/80 hover:text-[#AE00FF]'"
        title="Shuffle"
      >
        <i class="pi pi-shuffle" style="font-size:1rem"></i>
      </button>

      <!-- Volume -->
      <div class="relative flex items-center">
        <button
          @click="toggleVolume"
          class="text-white/80 hover:text-[#AE00FF] transition-colors"
          title="Volume"
        >
          <i :class="volume === 0 ? 'pi pi-volume-off' : 'pi pi-volume-up'" style="font-size:1rem"></i>
        </button>

        <!-- Volume slider popup -->
        <transition name="vol-slide">
          <div
            v-if="showVolume"
            class="absolute bottom-8 right-0 flex items-center gap-2 px-3 py-2 rounded-full"
            style="background: rgba(77,77,77,0.85); backdrop-filter: blur(8px); white-space:nowrap;"
          >
            <i class="pi pi-volume-down text-white/70" style="font-size:0.75rem"></i>
            <div
              class="relative w-20 h-1 cursor-pointer group"
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
            <i class="pi pi-volume-up text-white/70" style="font-size:0.75rem"></i>
          </div>
        </transition>
      </div>

      <!-- Chevron to detail -->
      <button
        @click="goToDetail"
        class="text-white/80 hover:text-[#AE00FF] transition-colors"
        title="Open detail"
      >
        <i class="pi pi-chevron-up" style="font-size:1rem"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { usePlayerStore } from '../stores/index.js'
import { useRouter, useRoute} from 'vue-router'

const store = usePlayerStore()
const router = useRouter()
const route = useRoute()

const audioEl = ref(null)
const showVolume = ref(false)
const isDragging = ref(false)

const currentSong = computed(() => store.currentSong)
const isPlaying = computed(() => store.isPlaying)
const isShuffled = computed(() => store.isShuffled)
const volume = computed(() => store.volume)
const mediaType = computed(() => store.mediaType)

const progressPercent = computed(() => {
  if (!store.duration) return 0
  return (store.currentTime / store.duration) * 100
})

// Watch isPlaying to control audio
watch(isPlaying, (val) => {
  if (!audioEl.value || mediaType.value !== 'audio') return
  if (val) audioEl.value.play().catch(() => {})
  else audioEl.value.pause()
})

// Watch currentSong to reload audio
watch(currentSong, (song) => {
  if (!song || mediaType.value !== 'audio') return
  setTimeout(() => {
    if (audioEl.value) {
      audioEl.value.load()
      if (isPlaying.value) audioEl.value.play().catch(() => {})
    }
  }, 100)
})

// Watch volume changes
watch(volume, (v) => {
  if (audioEl.value) audioEl.value.volume = v
})

// Watch seek from store
watch(() => store.currentTime, (t) => {
  if (isDragging.value) return
  if (audioEl.value && Math.abs(audioEl.value.currentTime - t) > 1) {
    audioEl.value.currentTime = t
  }
})

onMounted(() => {
  if (audioEl.value) audioEl.value.volume = volume.value
})

function onTimeUpdate() {
  store.updateTime(audioEl.value.currentTime)
}

function onLoadedMetadata() {
  store.updateDuration(audioEl.value.duration)
}

function onEnded() {
  store.nextTrack()
}

function handlePlayPause() {
  store.togglePlay()
}

function prevTrack() {
  store.prevTrack()
}

function nextTrack() {
  store.nextTrack()
}

function toggleShuffle() {
  store.toggleShuffle()
}

function toggleVolume() {
  showVolume.value = !showVolume.value
}

// Click outside to close volume
function handleClickOutside(e) {
  if (showVolume.value && !e.target.closest('.relative')) {
    showVolume.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

// Seek progress bar
function seekFromBar(e) {
  const bar = e.currentTarget
  const rect = bar.getBoundingClientRect()
  const ratio = (e.clientX - rect.left) / rect.width
  const newTime = ratio * store.duration
  store.seek(newTime)
  if (audioEl.value) audioEl.value.currentTime = newTime
}

// Volume seek
function seekVolume(e) {
  const bar = e.currentTarget
  const rect = bar.getBoundingClientRect()
  const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  store.setVolume(ratio)
}

// Volume Seek - Drag
function startVolumeDrag(e) {
  const bar = e.currentTarget

  const move = (ev) => {
    const rect = bar.getBoundingClientRect()

    const ratio = Math.max(
      0,
      Math.min(1, (ev.clientX - rect.left) / rect.width)
    )

    store.setVolume(ratio)
  }

  const up = () => {
    document.removeEventListener('mousemove', move)
    document.removeEventListener('mouseup', up)
  }

  document.addEventListener('mousemove', move)
  document.removeEventListener('mouseup', up)
}

// Drag seek
function startDrag(e) {
  isDragging.value = true
  const bar = e.currentTarget
  const onMove = (ev) => {
    const rect = bar.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width))
    const t = ratio * store.duration
    store.seek(t)
  }
  const onUp = (ev) => {
    const rect = bar.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width))
    const t = ratio * store.duration
    store.seek(t)
    if (audioEl.value) audioEl.value.currentTime = t
    isDragging.value = false
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

function goToDetail() {
  if (!currentSong.value) return
  if (mediaType.value === 'video') {
    router.push(`/video/${currentSong.value.id}`)
  } else {
    router.push(`/song/${currentSong.value.id}`)
  }
}
</script>

<style scoped>
.vol-slide-enter-active,
.vol-slide-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.vol-slide-enter-from,
.vol-slide-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
