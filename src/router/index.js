// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import SongDetail from '../pages/SongDetail.vue'
import Video from '../pages/Video.vue'
import VideoDetail from '../pages/VideoDetail.vue'
import Profile from '../pages/Profile.vue'
import Settings from '../pages/Settings.vue'
import Playlist from '../pages/Playlist.vue'

const routes = [
  { path: '/', component: HomePage },
  { path: '/song/:id', name: 'song-detail', component: SongDetail },
  { path: '/video', component: Video },
  { path: '/video/:id', component: VideoDetail },
  { path: '/profile', component: Profile },
  { path: '/settings', component: Settings },
  { path: '/playlist/:id', component: Playlist },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
