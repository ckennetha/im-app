<script setup lang="ts">
import ConceptsTable from "./concept/ConceptTable.vue"
import type { ConceptData } from "./concept/columns"
import { ExtrasPosition } from "./extras"

import type { PositionInfo } from "@/composables/useExplorePath"

const { positionInfo } = defineProps<{
  feature: number;
  concepts?: ConceptData[];
  positionInfo?: PositionInfo;
}>()
</script>

<template>
  <div class="space-y-3 w-full text-left">
    <div class="flex flex-1 flex-nowrap items-center gap-x-3">
      <h1 class="text-3xl font-medium">{{ `f/${feature}` }}</h1>
      <ExtrasPosition v-if="positionInfo" :position-info="positionInfo" />
    </div>
    <ConceptsTable :data="concepts" />
  </div>
</template>