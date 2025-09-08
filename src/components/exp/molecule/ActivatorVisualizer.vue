<script setup lang="ts">
import { Button } from "@/components/ui/button"
import TokenVisualizer from "./TokenVisualizer.vue"

import initRDKit from "@/utils/initRDKit"
import { getBondInfo, moleculeToTokens } from "@/utils/pipeline"
import type { Token } from "@/utils/tokenize"
import { activationToColor } from "@/utils/visualizer"

import type { ActivatorSample } from "../types"
import { Copy } from "lucide-vue-next"

const { sample } = defineProps<{ sample: ActivatorSample[] }>()

// types
interface TokenVizProps {
  tokens: Token[];
  activationsPerFeature: number[];
  colorHexTokens: string[];
}

// workflow
const RDKit = await initRDKit()
const tokenVizProps: TokenVizProps[] = []

for (const { smiles, activations } of sample) {
  const mol = RDKit.get_mol(smiles)
  const bondInfo = getBondInfo(mol!)
  mol!.delete()
  
  const tokens = moleculeToTokens(smiles, bondInfo)
  const { colorHexTokens } = activationToColor(tokens, activations, false)

  tokenVizProps.push({
    tokens,
    activationsPerFeature: activations,
    colorHexTokens,
  })
}

// utils
function copyToClipboard(tokens: Token[]) {
  const smi = tokens.map(obj => obj.token).join("")
  navigator.clipboard.writeText(smi)
}
</script>

<template>
  <div v-for="(tokenVizProp, idx) in tokenVizProps" :key="idx"
    class="inline-flex flex-nowrap whitespace-nowrap items-center justify-start gap-x-1
      w-full last:pb-3"
  >
    <Button
      size="icon"
      class="size-6 !border-0 !shadow-none hover:!bg-background group"
      @click="copyToClipboard(tokenVizProp.tokens)"
    >
      <Copy class="!size-4 text-border group-hover:text-muted-foreground
        group-active:text-background"
      />
    </Button>
    <div>
      <TokenVisualizer 
        :tokens="tokenVizProp.tokens"
        :activations="tokenVizProp.activationsPerFeature"
        :color-hex-tokens="tokenVizProp.colorHexTokens"
      />
    </div>
  </div>
</template>