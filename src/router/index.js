import { createRouter, createWebHistory } from 'vue-router'
import GameMenu from '../views/GameMenu.vue'
import ElderlyGame from '../views/ElderlyGame.vue'
import CaregiverDashboard from '../views/CaregiverDashboard.vue'
import ShoppingGame from '../views/ShoppingGame.vue'
import CookingGame from '../views/CookingGame.vue'
import PuppetGame from '../views/PuppetGame.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'lobby', component: GameMenu },
    { path: '/game/pinball', name: 'pinball', component: ElderlyGame },
    { path: '/game/shopping', name: 'shopping', component: ShoppingGame },
    { path: '/game/cooking', name: 'cooking', component: CookingGame },
    { path: '/game/puppet', name: 'puppet', component: PuppetGame },
    { path: '/dashboard', name: 'dashboard', component: CaregiverDashboard }
  ]
})

export default router
