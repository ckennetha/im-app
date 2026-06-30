<script setup lang="ts">
import { TooltipProvider } from "@/components/ui/tooltip"

import ConceptsTable from "./concept/ConceptTable.vue"
import ConceptBadge from "./concept/ConceptBadge.vue"
import type { ConceptData } from "./concept/columns"

import type { PositionInfo } from "@/composables/useExplorePath"

const { positionInfo } = defineProps<{
  feature: number;
  concepts?: ConceptData[];
  positionInfo?: PositionInfo;
}>()

// position badge
const posValue = positionInfo?.corr
const posContent = `Position latent: \u03C1 = ${posValue?.toFixed(2)}`
</script>

<template>
  <div class="space-y-3 w-full text-left">
    <div class="flex flex-1 flex-nowrap items-center gap-x-2">
      <h1 class="text-3xl font-medium">{{ `f/${feature}` }}</h1>
      <TooltipProvider disableClosingTrigger>
        <ConceptBadge label="P" :value="posValue" :content="posContent"/>
      </TooltipProvider>
    </div>
    <ConceptsTable :data="concepts" />
  </div>
</template>