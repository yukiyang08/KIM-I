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
import DayScene from '../views/DayScene.vue'
import FamilyDashboard from '../views/FamilyDashboard.vue'
import UserProfile from '../views/UserProfile.vue'
import LoginPage from '../views/LoginPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/',               name: 'lobby',    component: GameMenu },
    { path: '/day',            name: 'day',      component: DayScene },
    { path: '/game/music',     name: 'music',    component: MusicRhythmGame },
    { path: '/game/shopping',  name: 'shopping', component: ShoppingGame },
    { path: '/game/cooking',   name: 'cooking',  component: CookingGame },
    { path: '/game/puppet',    name: 'puppet',   component: PuppetGame },
    { path: '/game/riddle',    name: 'riddle',   component: RiddleGame },
    { path: '/game/puzzle',    name: 'puzzle',   component: PuzzleGame },
    { path: '/dashboard',        name: 'dashboard',        component: CaregiverDashboard },
    { path: '/dashboard/family', name: 'dashboard-family', component: FamilyDashboard },
    { path: '/profile',          name: 'profile',          component: UserProfile },
    { path: '/login',            name: 'login',            component: LoginPage },
    { path: '/multiplayer',    name: 'multiplayer-lobby', component: MultiplayerLobby },
    { path: '/multiplayer/room/:roomId', name: 'multiplayer-room', component: MultiplayerRoom },
  ],
})

export default router
