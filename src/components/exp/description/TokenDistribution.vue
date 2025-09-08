<script setup lang="ts">
import type { ActivatedToken } from "."
import type { CoreTokenType } from "@/utils/tokenize"

import { NestedDonut, type NestedDonutSegment } from "@unovis/ts"
import { VisSingleContainer, VisTooltip, VisNestedDonut } from "@unovis/vue"

const { label, data, groupColors } = defineProps<{
  label: string;
  data: ActivatedToken[];
  groupColors: Record<CoreTokenType, string>;
}>()

// chart
const layers = [
  (d: ActivatedToken) => d.type,
  (d: ActivatedToken) => d.token.startsWith('other')
    ? d.token.split('-')[0]
    : d.token
]
const value = (d: ActivatedToken) => d.count

// options
const layerSettings = (i: number) => i === 0 && ({ width: 12 })
const segmentLabel = () => ''
const segmentColor = (d: NestedDonutSegment<ActivatedToken>) =>
  groupColors[d.data.key as CoreTokenType]

// tooltip
const triggers = {
  [NestedDonut.selectors.segment]: (d: NestedDonutSegment<ActivatedToken>) =>
    `
      <div class="px-2 py-1 rounded-md bg-primary-foreground/80 text-primary text-sm">
        <span>
          '${d.data.key}' (${d.value?.toLocaleString()})
        </span>
      </div>
    `
}
</script>

<template>
  <VisSingleContainer :data>
    <div class="flex absolute inset-0 items-center justify-center font-medium
      pointer-events-none"
    >
      <b class="font-medium">{{ label }}</b>
    </div>
    <VisTooltip :triggers :followCursor="false" />
    <VisNestedDonut :layers :value :layerSettings :segmentLabel :segmentColor
      direction="outwards"
    />
  </VisSingleContainer>
</template>

<style scoped>
:deep(div) {
  --vis-tooltip-background-color: none;
  --vis-tooltip-border-color: none;
  --vis-tooltip-text-color: none;
  --vis-tooltip-shadow-color: none;
  --vis-tooltip-backdrop-filter: none;
  --vis-tooltip-padding: 0;
}
</style>