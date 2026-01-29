<script setup lang="ts">
import { ref } from "vue"
import { ChevronDown, Info } from "lucide-vue-next"

import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

import { MoleculeSampleVisualizer, type ActivatorSample } from "./molecule"

const { samples } = defineProps<{ samples: Record<string, ActivatorSample[]> }>()

// state
const open = ref<boolean>(false)

// util
const handleHeader = (label: string): string => {
  if (label === "Top") {
    return "Activation Range ≥ 0.80"
  } else {
    const upperBound = Number(label)
    const lowerBound = (upperBound - 0.20).toFixed(2)
    return `Activation Range ${(upperBound).toFixed(2)}–${lowerBound}`
  }
}
</script>

<template>
  <div class="space-y-3 w-full text-left">
    <div class="flex flex-1 flex-wrap items-center gap-2">
      <h1 class="text-3xl font-medium">Activation Distribution</h1>
      <TooltipProvider disableClosingTrigger>
        <Tooltip v-model:open="open">
          <TooltipTrigger as-child>
            <Button size="icon" class="size-5 !px-0 !pt-1 !pb-0 !border-none !shadow-none hover:!bg-background"
              @click="open = !open"
            >
              <Info class="size-5 text-muted-foreground"/>
            </Button>
          </TooltipTrigger>
          <TooltipContent :collisionPadding="{ left: 20 }" class="bg-foreground text-background max-w-55 sm:max-w-78">
            We randomly sampled SMILES and grouped them into quintiles by their normalized maximum SAE activation.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
    <div v-if="samples" class="space-y-3">
      <Collapsible v-for="(sample, label, idx) in samples" :key="label" :defaultOpen="idx === 0" class="border-b-2">
        <CollapsibleTrigger class="relative flex flex-1 items-center justify-between mb-3 !p-0 w-full !border-none !rounded-none hover:underline [&[data-state=open]>svg]:rotate-180">
          <h2 class="text-xl text-left">{{ handleHeader(label) }}</h2>
          <ChevronDown class="size-4 text-muted-foreground transition-transform duration-200"/>
        </CollapsibleTrigger>
        <CollapsibleContent class="w-full">
          <Suspense>
            <template #default>
              <MoleculeSampleVisualizer :sample />
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
  </div>
</template>