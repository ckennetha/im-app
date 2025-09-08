<script setup lang="ts">
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Popover, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import FeatureStatistics from "./description/FeatureStatistics.vue"

import { Concepts, ConceptsMap, type ConceptKey, type ModelKey } from "@/config"
import type { FeatureStatistic } from "./description"

import { useFetch } from "@vueuse/core"
import { ChartPie } from "lucide-vue-next"
import { shallowRef, computed, watch, nextTick } from "vue"

const props = defineProps<{ model: ModelKey; feature: number }>()

// getter
// url
const url = computed<string>(() =>
  `https://api.github.com/repos/ckennetha/im-data/contents/${props.model}/stats/${props.feature}.json?ref=ext-stats`
)

const { data, statusCode, execute, abort } = useFetch(url, { immediate: false }).json()
const stats = shallowRef<FeatureStatistic | null>(null)

// concepts
const concepts = computed<ConceptKey[] | null>(() => {
  const ptr = `${props.model}/${props.feature}`
  return Object.prototype.hasOwnProperty.call(ConceptsMap, ptr)
  ? ConceptsMap[ptr]
  : null
})

// missing concept handler
const mailtoLink = computed<string>(() => {
  const params = new URLSearchParams({
    subject: "Concept Suggestion",
    body: `Model:\t${props.model}\nFeature:\t${props.feature}\nConcept(s):\nDescription:\n`
  })
  return `mailto:kennethasikinnn@gmail.com?${params.toString()}`
})

// utils
const decodeGitHubJSON = (raw: string): FeatureStatistic => { return JSON.parse(atob(raw)) }
const getConceptDesc = (key: ConceptKey): string => { return Concepts[key].description }

watch(() => url.value, async () => {
  abort()
  stats.value = null
  await nextTick()
  
  await execute()
  if (statusCode.value !== 200) {
    console.error(`Error status code: ${statusCode.value}`)
    return
  }
  stats.value = decodeGitHubJSON(data.value.content)
  data.value = null
}, { immediate: true })
</script>

<template>
  <div class="space-y-3 w-full text-left">
    <div class="flex flex-1 items-center gap-x-1">
      <h1 class="text-3xl font-medium">{{ `f/${feature}` }}</h1>
      <Popover>
        <PopoverTrigger as-child>
          <Button
            size="icon"
            class="!p-0 size-8 !border-none shadow-none hover:!bg-transparent group"
          >
            <ChartPie class="pt-1 size-6 text-ring group-hover:text-foreground" />
          </Button>
        </PopoverTrigger>
        <FeatureStatistics v-if="stats" :stats />
      </Popover>
    </div>
    <div v-if="concepts">
      <p v-for="concept in concepts" :key="concept">
        {{ getConceptDesc(concept) }}
      </p>
    </div>
    <Alert v-else class="warn">
      <AlertTitle>No concepts found!</AlertTitle>
      <AlertDescription class="inline">
        You can suggest one or more concepts <a :href="mailtoLink">here</a>.
      </AlertDescription>
    </Alert>
  </div>
</template>