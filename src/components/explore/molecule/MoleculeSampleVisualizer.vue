<script setup lang="ts">
import { ref, markRaw, nextTick } from "vue"
import { toast } from "vue-sonner"
import { Copy, Eye, EyeOff } from "lucide-vue-next"

import { Button } from "@/components/ui/button"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Molecule1DVisualizer, Molecule2DVisualizer } from "."

import type { Token } from "@/utils/tokenize"
import type { FeatureSample } from "."

import { Models } from "@/config"
import useModelParam from "@/composables/useModelParam"
import { cn } from "@/lib/utils"
import initRDKit from "@/utils/initRDKit"
import { getBondInfo, moleculeToTokens } from "@/utils/pipeline"
import { tokenizeBPE } from "@/utils/tokenizeBPE"
import { activationToColor } from "@/utils/visualizer"

const { sample } = defineProps<{ sample: FeatureSample[] }>()

// types
interface TokenVisProps {
  tokens: Token[];
  activationsPerFeature: number[];
  colorHexTokens: string[];
  svgOptionsString?: string;
}

interface ExploreSVGVis {
  idx: number;
  svg2DString: string;
}

// state
const shownStructure = ref<ExploreSVGVis[]>([])
const shownStructureRefs = ref<Record<number, HTMLElement>>({})

// workflow-utils
function expandActivations(sparse: [number, number][], length: number): number[] {
  const dense = new Array(length).fill(0)
  for (const [idx, val] of sparse) { dense[idx] = val }
  return dense
}

// workflow
const model = useModelParam()
const useBPE = Models[model.value]?.baseModel === "ChemBERTa"

const RDKit = await initRDKit()
const tokenVisProps: TokenVisProps[] = []

for (const { smiles, activations } of sample) {
  let tokens: Token[]
  if (useBPE) {
    tokens = await tokenizeBPE(smiles)
  } else {
    const mol = RDKit.get_mol(smiles)
    const bondInfo = getBondInfo(mol!)
    mol!.delete()
    tokens = moleculeToTokens(smiles, bondInfo)
  }

  const denseActivations = expandActivations(activations, tokens.length)
  const { colorHexTokens, svgOptionsString } = activationToColor(tokens, denseActivations, true)

  tokenVisProps.push({
    tokens,
    activationsPerFeature: denseActivations,
    colorHexTokens,
    svgOptionsString
  })
}

// utils
const copyToClipboard = (tokens: Token[]) => {
  navigator.clipboard.writeText(tokens.map(obj => obj.token).join(""))
  toast("Copied to clipboard!", {
    style: {
      background: '#e4f0f9',
      border: '1px solid #d7e8f6',
      color: '#276c7d',
    }
  })
}

function hideStructure(idx: number) {
  const arrIdx = shownStructure.value.findIndex(obj => obj.idx === idx)
  if (arrIdx !== -1) { shownStructure.value.splice(arrIdx, 1) }
}
async function showStructure(idx: number) {
  const smi = sample[idx].smiles
  const mol = RDKit.get_mol(smi)
  
  const svgOptionsString = tokenVisProps[idx].svgOptionsString!
  const svg2DString = mol!.get_svg_with_highlights(svgOptionsString)
  
  mol!.delete()

  const isEmpty = shownStructure.value.length === 0
  shownStructure.value.push(markRaw({ idx, svg2DString }))
  
  await nextTick()

  if (isEmpty) {
    const el = shownStructureRefs.value[idx]
    el.scrollIntoView({ behavior: "smooth", block: "center" })
  }
}

const isShown = (idx: number): boolean => {
  return shownStructure.value.findIndex(obj => obj.idx === idx) !== -1
}
const handleStructureRef = (idx: number, el: any) => {
  if (el) { shownStructureRefs.value[idx] = el.$el }
  else { delete shownStructureRefs.value[idx] }
}
const toggleStructureVisibility = (idx: number): void | Promise<void> => {
  isShown(idx) ? hideStructure(idx) : showStructure(idx)
}
</script>

<template>
  <div>
    <div class="overflow-x-auto">
      <TooltipProvider>
        <div v-for="(tokenVisProp, idx) in tokenVisProps" :key="idx" class="inline-flex flex-nowrap whitespace-nowrap items-center justify-start gap-x-3 w-full last:pb-3">
          <div class="pt-1">
            <Button size="icon" class="!px-0 size-5 !border-0 !shadow-none hover:!bg-background group"
              @click="copyToClipboard(tokenVisProp.tokens)"
            >
              <Copy class="!size-4 text-border group-hover:text-muted-foreground group-active:text-background" />
            </Button>
            <Button v-if="!useBPE" size="icon" class="!px-0 size-5 !border-0 !shadow-none hover:!bg-background group"
              @click="toggleStructureVisibility(idx)"
            >
              <component :is="isShown(idx) ? EyeOff : Eye"
                :class="cn(
                  '!size-4 group-hover:text-muted-foreground group-active:text-background',
                  isShown(idx) ? 'text-muted-foreground' : 'text-border'
                )"
              />
            </Button>
          </div>
          <div>
            <Molecule1DVisualizer
              :tokens="tokenVisProp.tokens"
              :activations="tokenVisProp.activationsPerFeature"
              :colorHexTokens="tokenVisProp.colorHexTokens"
              :isBPE="useBPE"
            />
          </div>
        </div>
      </TooltipProvider>
    </div>
    <div v-if="shownStructure.length > 0" class="grid molecule-grid gap-3 mt-2 mb-8 w-full">
      <Molecule2DVisualizer
        v-for="(svgVis) in shownStructure"
        :key="svgVis.idx"
        :ref="(el) => handleStructureRef(svgVis.idx, el)"
        :id="svgVis.idx"
        :svgString="svgVis.svg2DString"
      />
    </div>
  </div>
</template>