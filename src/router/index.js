import { createRouter, createWebHistory } from 'vue-router'
import GameMenu from '../views/GameMenu.vue'
import MusicRhythmGame from '../views/MusicRhythmGame.vue'
import CaregiverDashboard from '../views/CaregiverDashboard.vue'
import ShoppingGame from '../views/ShoppingGame.vue'
import CookingGame from '../views/CookingGame.vue'
import PuppetGame from '../views/PuppetGame.vue'
import RiddleGame from '../views/RiddleGame.vue'
import PuzzleGame from '../views/PuzzleGame.vue'
import MultiplayerLobby from '../views/MultiplayerLobby.vue'
import MultiplayerRoom from '../views/MultiplayerRoom.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/',               name: 'lobby',    component: GameMenu },
    { path: '/game/music',     name: 'music',    component: MusicRhythmGame },
    { path: '/game/shopping',  name: 'shopping', component: ShoppingGame },
    { path: '/game/cooking',   name: 'cooking',  component: CookingGame },
    { path: '/game/puppet',    name: 'puppet',   component: PuppetGame },
    { path: '/game/riddle',    name: 'riddle',   component: RiddleGame },
    { path: '/game/puzzle',    name: 'puzzle',   component: PuzzleGame },
    { path: '/dashboard',      name: 'dashboard',component: CaregiverDashboard },
    { path: '/multiplayer',    name: 'multiplayer-lobby', component: MultiplayerLobby },
    { path: '/multiplayer/room/:roomId', name: 'multiplayer-room', component: MultiplayerRoom },
  ],
})

export default router
