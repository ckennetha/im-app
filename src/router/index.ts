import { createRouter, createWebHashHistory } from "vue-router"
import { HomePage, AboutPage } from "@/components"
import { useFromRouteStore } from "@/store"
import { normalizeRouteExplore, normalizeRouteSearch } from "./utils"
import { DEFAULT_FEATURE, DEFAULT_MODEL } from "@/defaults"

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
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
    component: () => import("@/components/ExplorePage.vue"),
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
    component: () => import("@/components/SearchPage.vue"),
    beforeEnter: normalizeRouteSearch,
  },
  {
    path: '/about',
    name: 'About',
    component: AboutPage
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