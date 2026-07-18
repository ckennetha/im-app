import { computed, watch, shallowRef, nextTick } from "vue"
import { useRoute, useRouter, onBeforeRouteUpdate } from "vue-router"
import { useFetch } from "@vueuse/core"

import type { ConceptData } from "@/components/explore/concept/columns"
import type { FeatureSample } from "@/components/explore/molecule"
import type { ModelKey } from "@/config"

import useModelParam from "./useModelParam"
import { normalizeRouteExplore, normalizeRouteSearch } from "@/router/utils"

// type
export interface PositionInfo {
  corr: number | null;
  averageTokenLength: number | null;
  numSamples: number | null;
}

interface ConceptDataJSON {
  concepts?: ConceptData[];
  samples: Record<string, FeatureSample[]>;
  extras?: { positionInfo: PositionInfo };
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

  const url = computed<string>(() => `https://raw.githubusercontent.com/ckennetha/im-data/main/${model.value}/${feature.value}.json`)
  const { data, statusCode, execute, abort } = useFetch(url, { immediate: false }).json<ConceptDataJSON>()
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
      conceptJSON.value = data.value
      data.value = null
    },
  { immediate: true })

  return { model, feature, isInExplore, setBoth, conceptJSON }
}