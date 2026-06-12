import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { songs } from '../data/Data.js'


export const usePlayerStore = defineStore('player', () => {
  // Current playing track
  const currentSong = ref(null)
  const isPlaying = ref(false)
  const isShuffled = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(1)
  const mediaType = ref('audio') // 'audio' or 'video'

  // Shuffle order
  const shuffleOrder = ref([])

  // Computed: current index in songs array
  const currentIndex = computed(() => {
    if (!currentSong.value) return -1
    return songs.findIndex(s => s.id === currentSong.value.id)
  })

  // Play a song
  function playSong(song, type = 'audio') {
    currentSong.value = song
    mediaType.value = type
    isPlaying.value = true
    currentTime.value = 0
    if (isShuffled.value) generateShuffleOrder()
  }

  // Toggle play/pause
  function togglePlay() {
    isPlaying.value = !isPlaying.value
  }

  // Next track
  function nextTrack() {
    if (!currentSong.value) return
    let nextIndex
    if (isShuffled.value && shuffleOrder.value.length) {
      const pos = shuffleOrder.value.indexOf(currentIndex.value)
      nextIndex = shuffleOrder.value[(pos + 1) % shuffleOrder.value.length]
    } else {
      nextIndex = (currentIndex.value + 1) % songs.length
    }
    currentSong.value = songs[nextIndex]
    isPlaying.value = true
    currentTime.value = 0
  }

  // Previous track
  function prevTrack() {
    if (!currentSong.value) return
    let prevIndex
    if (isShuffled.value && shuffleOrder.value.length) {
      const pos = shuffleOrder.value.indexOf(currentIndex.value)
      prevIndex = shuffleOrder.value[(pos - 1 + shuffleOrder.value.length) % shuffleOrder.value.length]
    } else {
      prevIndex = (currentIndex.value - 1 + songs.length) % songs.length
    }
    currentSong.value = songs[prevIndex]
    isPlaying.value = true
    currentTime.value = 0
  }

  // Toggle shuffle
  function toggleShuffle() {
    isShuffled.value = !isShuffled.value
    if (isShuffled.value) generateShuffleOrder()
  }

  // Generate shuffle order
  function generateShuffleOrder() {
    const arr = songs.map((_, i) => i)
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    shuffleOrder.value = arr
  }

  // Update time
  function updateTime(time) {
    currentTime.value = time
  }

  // Update duration
  function updateDuration(dur) {
    duration.value = dur
  }

  // Set volume
  function setVolume(vol) {
    volume.value = Math.max(0, Math.min(1, vol))
}

  // Seek
  function seek(time) {
    currentTime.value = time
  }

  return {
    currentSong,
    isPlaying,
    isShuffled,
    currentTime,
    duration,
    volume,
    mediaType,
    currentIndex,
    playSong,
    togglePlay,
    nextTrack,
    prevTrack,
    toggleShuffle,
    updateTime,
    updateDuration,
    setVolume,
    seek,
  }
})

// Theme store
export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(localStorage.getItem('theme') !== 'light')

  function toggleTheme() {
    isDark.value = !isDark.value
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  }

  function setTheme(dark) {
    isDark.value = dark
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }

  return { isDark, toggleTheme, setTheme }
})

// Profile store
export const useProfileStore = defineStore('profile', () => {
  const username = ref('Guest')
  const profileImage = ref('')

  function loadProfile() {
    const data = localStorage.getItem('profile')

    if (data) {
      const parsed = JSON.parse(data)

      username.value = parsed.username || 'Guest'
      profileImage.value = parsed.profileImage || ''
    }
  }

  function saveProfile(name, image) {
    username.value = name || 'Guest'
    profileImage.value = image || ''

    localStorage.setItem(
      'profile',
      JSON.stringify({
        username: username.value,
        profileImage: profileImage.value
      })
    )
  }

  return {
    username,
    profileImage,
    loadProfile,
    saveProfile
  }
})
