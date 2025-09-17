import { Home, About } from "@/components"
import { DEFAULT_FEATURE, DEFAULT_MODEL } from "@/cfg"
import { useFromRouteStore } from "@/store"

import { normalizeRouteExplore, normalizeRouteSearch } from "./utils"
import { createRouter, createWebHashHistory } from "vue-router"

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/explore',
    redirect: {
      name: 'Explore', params: {
        model: DEFAULT_MODEL, feature: DEFAULT_FEATURE
      }
    }
  },
  {
    path: '/explore/:model/:feature',
    name: 'Explore',
    component: () => import("@/components/Explore.vue"),
    beforeEnter: normalizeRouteExplore
  },
  {
    path: '/search',
    redirect: {
      name: 'Search', params: { model: DEFAULT_MODEL }
    }
  },
  {
    path: '/search/:model',
    name: 'Search',
    component: () => import("@/components/Search.vue"),
    beforeEnter: normalizeRouteSearch,
  },
  {
    path: '/about',
    name: 'About',
    component: About
  }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

router.afterEach((_, from) => {
  useFromRouteStore().setFromRoute(from)
})

export default router