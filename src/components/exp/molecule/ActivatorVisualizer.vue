<script setup lang="ts">
import { Button } from "@/components/ui/button"
import { MoleculeVisualizer, TokenVisualizer } from "."

import { cn } from "@/lib/utils"
import initRDKit from "@/utils/initRDKit"
import { getBondInfo, moleculeToTokens } from "@/utils/pipeline"
import type { Token } from "@/utils/tokenize"
import { activationToColor } from "@/utils/visualizer"

import type { ActivatorSample } from "../types"
import { Copy, Eye, EyeOff } from "lucide-vue-next"
import { ref, markRaw, onMounted } from "vue"

const { sample } = defineProps<{ sample: ActivatorSample[] }>()

// types
interface TokenVizProps {
  tokens: Token[];
  activationsPerFeature: number[];
  colorHexTokens: string[];
  svgOptionsString?: string;
}

interface SVGViz {
  idx: number;
  svg2DString: string;
}

// state
const showStructure = ref<SVGViz[]>([])

// workflow
const RDKit = await initRDKit()
const tokenVizProps: TokenVizProps[] = []

for (const { smiles, activations } of sample) {
  const mol = RDKit.get_mol(smiles)
  const bondInfo = getBondInfo(mol!)
  mol!.delete()
  
  const tokens = moleculeToTokens(smiles, bondInfo)
  const { colorHexTokens, svgOptionsString } = activationToColor(tokens, activations, true)

  tokenVizProps.push({
    tokens,
    activationsPerFeature: activations,
    colorHexTokens,
    svgOptionsString
  })
}

// utils
function copyToClipboard(tokens: Token[]) {
  const smi = tokens.map(obj => obj.token).join("")
  navigator.clipboard.writeText(smi)
}

function isShown(idx: number) {
  return showStructure.value.findIndex(obj => obj.idx === idx) !== -1
}

function drawStructure(idx: number) {
  const smiles = sample[idx].smiles
  const mol = RDKit.get_mol(smiles)

  const svgOptionsString = tokenVizProps[idx].svgOptionsString!
  const svg2DString = mol!.get_svg_with_highlights(svgOptionsString)
  mol!.delete()

  showStructure.value.push( markRaw({ idx, svg2DString }) )
}

function onStructureHide(idx: number) {
  const arrIdx = showStructure.value.findIndex(obj => obj.idx === idx)
  if (idx !== -1) { showStructure.value.splice(arrIdx, 1) }
}

function onStructureVisible(idx: number) {
  drawStructure(idx)
}

function handleStructureVisibility(idx: number) {
  isShown(idx) ? onStructureHide(idx) : onStructureVisible(idx)
}

onMounted(() => { for (let i = 0; i < sample.length; i++) onStructureVisible(i) })
</script>

<template>
  <div>
    <div class="overflow-x-auto">
      <div v-for="(tokenVizProp, idx) in tokenVizProps" :key="idx"
        class="inline-flex flex-nowrap whitespace-nowrap items-center justify-start
          gap-x-3 w-full last:pb-3"
      >
        <div>
          <Button
            size="icon"
            class="!px-0 size-6 !border-0 !shadow-none hover:!bg-background group"
            @click="copyToClipboard(tokenVizProp.tokens)"
          >
            <Copy class="!size-4 text-border group-hover:text-muted-foreground
              group-active:text-background"
            />
          </Button>
          <Button
            size="icon"
            class="!px-0 size-6 !border-0 !shadow-none hover:!bg-background group"
            @click="handleStructureVisibility(idx)"
          >
            <component
              :is="isShown(idx) ? EyeOff : Eye"
              :class="cn('!size-4 group-hover:text-muted-foreground group-active:text-background',
                isShown(idx) ? 'text-muted-foreground' : 'text-border'
              )"
            />
          </Button>
        </div>
        <div>
          <TokenVisualizer
            :tokens="tokenVizProp.tokens"
            :activations="tokenVizProp.activationsPerFeature"
            :colorHexTokens="tokenVizProp.colorHexTokens"
          />
        </div>
      </div>
    </div>
    <div v-if="showStructure.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2 mb-8 w-full"
    >
      <MoleculeVisualizer
        v-for="(svgViz, id) in showStructure"
        :key="id"
        :id="svgViz.idx"
        :svgString="svgViz.svg2DString"
      />
    </div>
  </div>
</template>