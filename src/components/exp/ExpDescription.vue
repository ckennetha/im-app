<script setup lang="ts">
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "../ui/tooltip"

import ConceptsTable from "./description/ConceptsTable.vue"
import type { ConceptData } from "./description/columns"

import { type ModelKey } from "@/config"
import { useFetch } from "@vueuse/core"

import { CircleQuestionMark } from "lucide-vue-next"
import { shallowRef, ref, computed, watch, nextTick } from "vue"

const props = defineProps<{ model: ModelKey; feature: number }>()

// getter
// url
const open = ref<boolean>(false)
const url = computed<string>(() =>
  `https://api.github.com/repos/ckennetha/im-data/contents/${props.model}/descs/${props.feature}.json?ref=ext-descs`
)

const { data, statusCode, execute, abort } = useFetch(url, { immediate: false }).json()
const conceptData = shallowRef<ConceptData[] | null>(null)

// missing concept handler
const mailtoLink = computed<string>(() => {
  const params = new URLSearchParams({
    subject: "Concept Suggestion",
    body: `Model:\t${props.model}\nFeature:\t${props.feature}\nConcept(s):\nDescription:\n`
  })
  return `mailto:kennethasikinnn@gmail.com?${params.toString()}`
})

// utils
const decodeGitHubJSON = (raw: string): any => { return JSON.parse(atob(raw)) }

watch(() => url.value, async () => {
  abort()
  conceptData.value = []
  await nextTick()
  
  await execute()
  if (statusCode.value !== 200) {
    console.error(`Error status code: ${statusCode.value}`)
    conceptData.value = null
    return
  }
  conceptData.value = decodeGitHubJSON(data.value.content)
  data.value = null
}, { immediate: true })
</script>

<template>
  <div class="space-y-3 w-full text-left">
    <TooltipProvider disableClosingTrigger>
      <div class="flex flex-1 flex-nowrap items-center gap-x-2">
    <h1 class="text-3xl font-medium">{{ `f/${feature}` }}</h1>
        <Tooltip v-model:open="open">
          <TooltipTrigger as-child>
            <Button size="icon" class="!size-5 !px-0 !pt-1 !pb-0 !border-none !shadow-none
              hover:!bg-background"
              @click="open = !open"
            >
              <CircleQuestionMark class="size-5 text-muted-foreground"/>
            </Button>
          </TooltipTrigger>
          <TooltipContent class="bg-foreground text-background max-w-56 sm:max-w-102"
            :collisionPadding="{ left: 20, }"
          >
            We calculated SAE activations across ~1,300,000 unique canonical SMILES.
            These metrics describe how this feature behaves for a specific concept
            when activations are above the 0.00 and 0.20 thresholds.
            <br><br>
            We subsequently select concepts that contain at least 100 tokens in the
            samples with an F1 score ≥ 0.50, or at least 1000 tokens with Precision
            or Recall ≥ 0.80 or F1 score ≥ 0.50.
          </TooltipContent>
        </Tooltip>
      </div>
    <div v-if="conceptData">
      <ConceptsTable v-if="conceptData.length > 0" :data="conceptData" />
      <div v-else class="flex items-center justify-center h-24 overflow-y-hidden">
        <img src="/im-spinner.svg" class="animate-spin h-24"/>
      </div>
    </div>
    <Alert v-else class="warn">
      <AlertTitle>No concepts found!</AlertTitle>
      <AlertDescription class="inline">
        You can suggest one or more concepts <a :href="mailtoLink">here</a>.
      </AlertDescription>
    </Alert>
    </TooltipProvider>
  </div>
</template>