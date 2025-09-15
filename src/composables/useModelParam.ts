import type { ModelKey } from "@/config"

import { computed } from "vue"
import { useRoute, useRouter } from "vue-router"

export default function useModelPath() {
  const route = useRoute()
  const router = useRouter()

  const model = computed<ModelKey>({
    get: () => String(route.params.model) as ModelKey,
    set: (v: string) => {
      router.push({
        name: route.name as string,
        params: { ...route.params, model: v },
        query: route.query,
      })
    },
  })

  return model
}