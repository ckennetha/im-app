<script setup lang="ts">
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { type Token } from "@/utils/tokenize"

const { tokens, activations, colorHexTokens } = defineProps<{
  tokens: Token[];
  activations: number[];
  colorHexTokens: string[];
}>()
</script>

<template>
<Tooltip v-for="(tk, idx) in tokens" :key="idx">
  <TooltipTrigger as-child>
    <span
      :style="{ backgroundColor: colorHexTokens[idx] }"
      class="text-base cursor-pointer"
    >
      {{ tk.token }}
    </span>
  </TooltipTrigger>
  <TooltipContent class="bg-primary-foreground text-primary">
    <ul class="text-center">
      <li>Position: {{ idx }}</li>
      <li>Activation: {{ activations[idx].toFixed(2) }}</li>
      <li v-if="tk.type !== 'atom' && tk.type !== 'bond'">
        Type: {{ tk.type }}
      </li>
      <li v-if="tk.type === 'atom'">
        Atom index: {{ tk.typeIndex }}
      </li>
      <li v-if="tk.type === 'bond'">
        Bond index: {{ tk.typeIndex }}
      </li>
    </ul>
  </TooltipContent>
</Tooltip>
</template>