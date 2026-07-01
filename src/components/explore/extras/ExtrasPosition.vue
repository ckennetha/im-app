<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Separator } from "@/components/ui/separator"
import { Slider } from '@/components/ui/slider'

import type { PositionInfo } from '@/composables/useExplorePath'
import { DEFAULT_DIVERGING_COLORS } from '@/defaults'
import { DEFAULT_DIVERGING_CMAP, mapColorDivergent } from '@/utils/colors'

const { positionInfo } = defineProps<{ positionInfo: PositionInfo }>()

const trackGradient = `linear-gradient(to right, ${DEFAULT_DIVERGING_COLORS.join(', ')})`

const mainColor = mapColorDivergent(positionInfo.corr, DEFAULT_DIVERGING_CMAP).toHexString()
const textColor = Math.abs(positionInfo.corr) >= 0.25 ? '#fafafa' : '#212427'
</script>

<template>
  <HoverCard :open-delay="200">
    <HoverCardTrigger as-child>
      <Badge variant="outline"
        class="flex mt-1 items-center justify-center cursor-default"
        :style="{ backgroundColor: mainColor, color: textColor, }"
      >
        Position
      </Badge>
    </HoverCardTrigger>
    <HoverCardContent class="w-64 space-y-3 text-xs text-muted-foreground">
      <div class="items-center space-y-2">
        <div class="flex justify-between">
          <span>Spearman correlation (ρ)</span>
          <span class="font-medium text-foreground">
            {{ positionInfo.corr.toFixed(2) }}
          </span>
        </div>
        <Slider
          :model-value="[positionInfo.corr]"
          :min="-1"
          :max="1"
          :step="0.01"
          disabled
          :style="{ '--track-gradient': trackGradient, '--thumb-color': mainColor }"
          class="
            data-[disabled]:opacity-100
            [&_[data-slot='slider-track']]:bg-[image:var(--track-gradient)]
            [&_[data-slot='slider-range']]:bg-transparent
            [&_[data-slot='slider-thumb']]:border-2
            [&_[data-slot='slider-thumb']]:border-background
            [&_[data-slot='slider-thumb']]:bg-[var(--thumb-color)]
            [&_[data-slot='slider-thumb']]:ring-1
            [&_[data-slot='slider-thumb']]:ring-border
          "
        />
        <div class="flex justify-between text-[10px]">
          <span>-1</span>
          <span>1</span>
        </div>
      </div>
      <Separator />
      <div class="grid grid-cols-2 gap-2">
        <div>
          <div>Sample size</div>
          <div class="pt-1 font-medium text-foreground">
            {{ positionInfo.numSamples.toLocaleString() }}/250,000
          </div>
        </div>
        <div>
          <div>Avg. token length</div>
          <div class="pt-1 font-medium text-foreground">
            {{ positionInfo.averageTokenLength.toFixed(1) }}
          </div>
        </div>
      </div>
    </HoverCardContent>
  </HoverCard>
</template>