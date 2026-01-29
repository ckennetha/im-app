<script setup lang="ts">
import { ref } from "vue"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

import { mapColorDivergent, DEFAULT_DIVERGING_CMAP } from "@/utils/colors"

const { value } = defineProps<{ label: string; value?: number; content?: string }>()

const backgroundColor = value ? mapColorDivergent(value, DEFAULT_DIVERGING_CMAP) : '#e5e5e5'
const textColor = Math.abs(value ?? 0) >= 0.1 ? '#ffffff' : '#a1a1a1'

// state
const open = ref<boolean>(false)
</script>

<template>
  <Tooltip v-model:open="open">
    <TooltipTrigger as-child>
      <Button class="size-4.5 flex items-center justify-center !p-0 !pb-0.5 mt-0.5 !text-xs !border-none !shadow-none !rounded-sm"
        :style="{
          backgroundColor: backgroundColor,
          color: textColor,
        }"
        @click="open = !open"
      >
        {{ label }}
      </Button>
    </TooltipTrigger>
    <TooltipContent :collisionPadding="{ left: 20 }" side="right" class="bg-foreground text-background max-w-66.5">
      {{ content }}
    </TooltipContent>
  </Tooltip>
</template>