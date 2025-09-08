import { defineStore } from "pinia"
import { ref } from "vue"
import type { RouteLocationNormalizedLoaded } from "vue-router"

export const useFromRouteStore = defineStore('fromRoute', () => {
  // state
  const fromRoute = ref<RouteLocationNormalizedLoaded>()

  // action
  const setFromRoute = (from: RouteLocationNormalizedLoaded): void => {
    fromRoute.value = from
  }

  return { fromRoute, setFromRoute }
})