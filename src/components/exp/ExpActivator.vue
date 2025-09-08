<script setup lang="ts">
import { Button } from "@/components/ui/button"
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible"

import type { ModelKey } from "@/config"
import type { ActivatorSample } from "./types"

import { useFetch } from "@vueuse/core"
import { ChevronDown, CircleQuestionMark } from "lucide-vue-next"
import { computed, shallowRef, watch, nextTick } from "vue"
import { ActivatorVisualizer } from "./molecule"

const props = defineProps<{ model: ModelKey, feature: number }>()

// state
const url = computed<string>(() =>
  `https://api.github.com/repos/ckennetha/im-data/contents/${props.model}/samples/${props.feature}.json?ref=ext-stats`
)

const { data, statusCode, execute, abort } = useFetch(url, { immediate: false }).json()
const ssv = shallowRef<Record<string, ActivatorSample[]> | null>(null)

// utils
function decodeGitHubJSON(raw: string) {
  return JSON.parse(atob(raw)) as Record<string, ActivatorSample[]>
}

watch(
  [() => props.model, () => props.feature],
  async () => {
    abort()
    ssv.value = null
    await nextTick()

    await execute()
    if (statusCode.value !== 200) {
      console.error(`Error status code: ${statusCode.value}`)
      return
    }
    ssv.value = decodeGitHubJSON(data.value.content)
    data.value = null
  },
{ immediate: true })
</script>

<template>
  <div class="space-y-3 w-full text-left">
    <TooltipProvider>
      <div class="flex flex-1 flex-nowrap items-center gap-x-2">
        <h1 class="text-3xl font-medium">Activation Distribution</h1>
        <Tooltip>
          <TooltipTrigger as-child>
            <Button size="icon" class="size-5 !px-0 !pt-1 !pb-0
              !border-none !shadow-none hover:!bg-background"
            >
              <CircleQuestionMark class="size-5 text-muted-foreground"/>
            </Button>
          </TooltipTrigger>
          <TooltipContent class="bg-foreground text-background w-74 pb-2">
            We randomly sampled SMILES from the ~1,300,000 sample pool
            and grouped them into quintiles by their normalized
            maximum SAE activation.
          </TooltipContent>
        </Tooltip>
      </div>
      <div v-if="ssv" class="space-y-3">
        <Collapsible v-for="(sample, label, idx) in ssv" :key="label" :defaultOpen="idx === 0"
          class="border-b-2"
        >
          <CollapsibleTrigger class="relative flex flex-1 items-center justify-between
            mb-3 !p-0 w-full !border-none !rounded-none hover:underline
            [&[data-state=open]>svg]:rotate-180"
          >
            <h2 class="text-xl text-left">
              {{ 'Activation Range ' + ( label === 'Top' ? '≥ 0.80' : `${label}` ) }}
            </h2>
            <ChevronDown class="size-4 text-muted-foreground transition-transform duration-200"/>
          </CollapsibleTrigger>
          <CollapsibleContent class="w-full overflow-x-auto">
            <Suspense>
              <template #default>
                <ActivatorVisualizer :sample />
              </template>
              <template #fallback>
                <div class="flex items-center justify-center h-48 overflow-y-hidden">
                  <img src="/im-spinner.svg" class="animate-spin h-24"/>
                </div>
              </template>
            </Suspense>
          </CollapsibleContent>
        </Collapsible>
      </div>
      <div v-else class="flex items-center justify-center h-48 overflow-y-hidden">
        <img src="/im-spinner.svg" class="animate-spin h-24"/>
      </div>
    </TooltipProvider>
  </div>
</template>