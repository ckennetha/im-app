import { useRouter, onBeforeRouteUpdate, type LocationQueryRaw } from "vue-router"
import useModelParam from "./useModelParam"
import { normalizeRouteSearch } from "@/router/utils"

export default function useSearchPath() {
  const model = useModelParam()
  const router = useRouter()

  function pushQuery(q: LocationQueryRaw) {
    router.push({
      name: "Search",
      params: { model: model.value },
      query: q,
    })
  }

  onBeforeRouteUpdate((to, from, next) => {
    const redirect = normalizeRouteSearch(to, from)
    if (redirect) next(redirect)
    else next()
  })

  return { model, pushQuery }
}