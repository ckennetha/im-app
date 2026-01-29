import { computed, watch, shallowRef, nextTick } from "vue"
import { useRoute, useRouter, onBeforeRouteUpdate } from "vue-router"
import { useFetch } from "@vueuse/core"

import type { ConceptData } from "@/components/explore/concept/columns"
import type { ActivatorSample } from "@/components/explore/molecule"
import type { ModelKey } from "@/config"

import useModelParam from "./useModelParam"
import { normalizeRouteExplore, normalizeRouteSearch } from "@/router/utils"

// type
export interface AddOnPositions {
  corr: number; propSample: number;
}

interface ConceptDataJSON {
  description?: ConceptData[];
  samples: Record<string, ActivatorSample[]>;
  additional?: AddOnPositions;
}

export default function useExplorePath() {
  const model = useModelParam()

  const route = useRoute()
  const router = useRouter()

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

  const url = computed<string>(() => `https://api.github.com/repos/ckennetha/im-data/contents/${model.value}/${feature.value}.json?ref=main`)
  const { data, statusCode, execute, abort } = useFetch(url, { immediate: false }).json()
  const conceptJSON = shallowRef<ConceptDataJSON | null>(null)

  function setBoth(next: { model: ModelKey; feature: number }) {
    router.push({
      name: 'Explore',
      params: { model: String(next.model), feature: String(next.feature) }
    })
  }

  onBeforeRouteUpdate((to, from, next) => {
    const redirect = from.name === "Explore"
      ? normalizeRouteExplore(to, from)
      : normalizeRouteSearch(to, from)

    if (redirect) next(redirect)
    else next()
  })

  watch(
    [() => model.value, () => feature.value],
    async () => {
      if (route.name !== "Explore") return

      abort()
      conceptJSON.value = null
      await nextTick()

      await execute()
      if (statusCode.value !== 200) {
        console.error(`Error status code: ${statusCode.value}`)
        return
      }
      conceptJSON.value = JSON.parse(atob(data.value.content))
      data.value = null
    },
  { immediate: true })

  return { model, feature, isInExplore, setBoth, conceptJSON }
}