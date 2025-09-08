<script setup lang="ts">
import { PopoverContent } from "@/components/ui/popover"
import TokenDistribution from "./TokenDistribution.vue"
import type { FeatureStatistic } from "."

import { DEFAULT_CATEGORICAL_COLORS } from "@/cfg"
import { coreTokenTypes } from "@/utils/tokenize"
import { useMediaQuery } from "@vueuse/core"

const { stats } = defineProps<{ stats: FeatureStatistic }>()

// state
const isSmall = useMediaQuery('(max-width: 469px)')

// default
const groupColors = Object.fromEntries(
  coreTokenTypes.map((cTT, idx) => [cTT, DEFAULT_CATEGORICAL_COLORS[idx]])
)
</script>

<template>
  <PopoverContent class="w-84" :side="isSmall ? 'bottom' : 'right'"
    :collisionPadding="{ top: 20, left: 20 }"
  >
    <p class="text-sm">
      We calculated SAE activations across ~1,300,000
      unique canonical SMILES. These statistics
      describe the behavior of this feature when
      activated above the 0.00 and 0.20 thresholds.
    </p>
    <div v-if="stats" class="mt-3">
      <h2 class="text-base leading-none font-medium">
        Activation frequency
      </h2>
      <div class="grid grid-cols-2 mt-2 text-sm">
        <p v-for="(actMP, thr) in stats.activatedMoleculePct" :key="thr">
          <b class="font-medium">@{{ thr }}:</b>
          {{ (Number(actMP) * 100).toFixed(2) }}%
        </p>
      </div>
      <h2 class="mt-3 text-base leading-none font-medium">
        Token distribution
      </h2>
      <div class="grid grid-cols-2 gap-x-5 mt-3 text-sm">
        <TokenDistribution
          v-for="(actTk, label) in stats.activatedTokens"
          :key="label"
          :label="`@${label}`"
          :data="actTk"
          :groupColors
          class="max-h-36"
        />
      </div>
    </div>
  </PopoverContent>
</template>