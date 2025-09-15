import type { ModelKey } from "@/config"
import { normalizeRouteExplore, normalizeRouteSearch } from "@/router/utils"

import useModelParam from "./useModelParam"

import { computed } from "vue"
import { useRoute, useRouter, onBeforeRouteUpdate } from "vue-router"

export default function useExplorePath() {
  const model = useModelParam()

  const route = useRoute()
  const router = useRouter()

  // state
  const isInExplore = computed<boolean>(() => route.name === "Explore" || false)

  const feature = computed<number>({
    get: () => Number(route.params.feature),
    set: (v: number) => {
      router.push({
        name: 'Explore',
        params: { ...route.params, feature: v },
      })
    },
  })

  function setBoth(next: { model: ModelKey; feature: number }) {
    router.push({
      name: 'Explore',
      params: {
        model: String(next.model),
        feature: String(next.feature),
      }
    })
  }

  onBeforeRouteUpdate((to, from, next) => {
    const redirect = from.name === "Explore"
      ? normalizeRouteExplore(to, from)
      : normalizeRouteSearch(to, from)

    if (redirect) next(redirect)
    else next()
  })

  return { model, feature, isInExplore, setBoth }
}