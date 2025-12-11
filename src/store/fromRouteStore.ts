import { ref } from "vue"
import type { RouteLocationNormalizedLoaded } from "vue-router"
import { defineStore } from "pinia"

export const useFromRouteStore = defineStore('fromRoute', () => {
  // state
  const fromRoute = ref<RouteLocationNormalizedLoaded>()

  // action
  const setFromRoute = (from: RouteLocationNormalizedLoaded): void => { fromRoute.value = from }
  
  return { fromRoute, setFromRoute }
})