<script setup lang="ts">
import { shallowRef, watch, onMounted } from "vue"
import { SquareArrowOutUpRight } from "lucide-vue-next"
import type { ColumnDef } from "@tanstack/vue-table"
import type { RDKitModule } from "@rdkit/rdkit"

import { CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { TooltipProvider } from "@/components/ui/tooltip"

import {
  createActivationColumns, toFlatTokenActivation, type FlatTokenActivation
} from "../activation/columns"
import ActivationTable from "../activation/ActivationTable.vue"
import { Molecule1DVisualizer } from "."

import { useMoleculePipeline, type PipelineStage } from "@/composables/useMoleculePipeline"
import type { ModelKey } from "@/config"

import { cn } from "@/lib/utils"
import initRDKit from "@/utils/initRDKit"
import { activationToColor } from "@/utils/visualizer"

const { model, feature, id, smi, canonicalize = true } = defineProps<{
  model: ModelKey;
  feature: number;
  id: string;
  smi: string;
  canonicalize?: boolean;
}>()

const emit = defineEmits<{
  (e: 'loading', v: boolean): void;
  (e: PipelineStage): void;
}>()

// type
interface VisualizerProps {
  colorHexTokens: string[];
  svg2DString: string;
}

// states
const columns = shallowRef<ColumnDef<FlatTokenActivation>[]>()
const data = shallowRef<FlatTokenActivation[] | null>(null)

const activationsAtFeature = shallowRef<number[]>([])
const visProps = shallowRef<VisualizerProps>({ colorHexTokens: [], svg2DString: "" })

const {
  isSmilesInvalid, statusPipeline, validSmiles, tokens, activations, processor,
} = useMoleculePipeline(true)

// utils
function getActivationsAtFeature() {
  const featureActivations = activations.value?.[String(feature)]
  const tmpActivations = new Array(tokens.value?.length).fill(0.0)
  if (featureActivations) {
    const { data, indices } = featureActivations
    indices.forEach((tkIdx, idx) => {
      tmpActivations[tkIdx] = data[idx]
    })
  }
  activationsAtFeature.value = tmpActivations
}

function getVisualization(RDKit: RDKitModule) {
  const { colorHexTokens, svgOptionsString } = activationToColor(
    tokens.value, activationsAtFeature.value, true
  )

  const mol = RDKit!.get_mol(validSmiles.value!)
  const svg2DString = mol!.get_svg_with_highlights(svgOptionsString!)
  mol!.delete()

  visProps.value = { colorHexTokens, svg2DString }
}

onMounted(async () => {
  try {
    statusPipeline.value = "tokenizing"
    emit('loading', true)
    const RDKit = await initRDKit()
    await processor(smi, model, RDKit, canonicalize)

    if (isSmilesInvalid.value || tokens.value.length === 0) {
      throw new Error("Invalid SMILES string!")
    }

    if (!activations.value) {
      throw new Error("No activation data.")
    }

    getActivationsAtFeature()
    statusPipeline.value = "visualizing"
    getVisualization(RDKit)

    columns.value = createActivationColumns(tokens.value, false)
    data.value = toFlatTokenActivation(activations.value)
  } catch (err) {
    console.error("Error:", err)
  } finally {
    emit('loading', false)
    statusPipeline.value = "idle"
  }
})

watch([() => model, () => feature], async (
  [newModel], [oldModel]
) => {
  try {
    // reset
    statusPipeline.value = "tokenizing"
    emit('loading', true)

    const RDKit = await initRDKit()
    if (newModel !== oldModel) {
      data.value = null
      await processor(smi, newModel, RDKit, canonicalize)

      if (!activations.value) {
        throw new Error("No activation data.")
      }
      
      columns.value = createActivationColumns(tokens.value, false)
      data.value = toFlatTokenActivation(activations.value)
    }

    getActivationsAtFeature()
    statusPipeline.value = "visualizing"
    getVisualization(RDKit)
  } catch (err) {
    console.error('Error:', err)
  } finally {
    emit('loading', false)
    statusPipeline.value = "idle"
  }
})

watch(statusPipeline, (newStage) => emit(newStage))
</script>

<template>
  <div
    :id="id"
    :class="cn(
      'aspect-square border rounded-md shadow-xs hover:ring-1',
      isSmilesInvalid
        ? 'bg-[#f3cfd3] border-[#f4bbbf] hover:ring-[#a1313b]'
        : 'hover:ring-ring/50'
    )"
  >
    <CollapsibleTrigger as-child>
      <div v-if="statusPipeline === 'idle'" class="relative w-full h-full">
        <p
          :class="cn(
            'absolute inline-block top-0 left-0 max-w-3/4 px-3 py-2 text-sm font-medium bg-foreground/5 rounded-tl-md truncate cursor-pointer',
            isSmilesInvalid ? 'pointer-events-none' : ''
          )"
        >
          {{ id }}
        </p>
        <button :aria-label="`Show ${id}`" :disabled="isSmilesInvalid">
          <template v-if="!isSmilesInvalid">
            <img :src="`data:image/svg+xml;charset=utf-8,${encodeURIComponent(visProps?.svg2DString!)}`"
              :alt="`${id}`" class="w-full h-full object-contain"
            >
          </template>
          <p v-else class="col-start-2 line-clamp-1 min-h-4 text-base font-medium tracking-tight">
            Invalid SMILES string!
          </p>
        </button>
      </div>
      <div v-else class="relative w-full h-full">
        <button class="flex justify-center items-center" disabled>
          <img src="/im-spinner.svg" class="animate-spin w-1/2"/>
        </button>
      </div>
    </CollapsibleTrigger>
    <CollapsibleContent>
      <div class="space-y-5 px-5 py-3 text-center">
        <div class="space-y-2">
          <h2 class="text-xl font-medium">
            {{ canonicalize ? "Canonical SMILES" : "SMILES" }}
          </h2>
          <div class="w-full overflow-x-auto">
            <div class="inline-flex flex-nowrap">
              <TooltipProvider>
                <Molecule1DVisualizer
                  :tokens
                  :activations="activationsAtFeature"
                  :colorHexTokens="visProps.colorHexTokens"
                />
              </TooltipProvider>
            </div>
          </div>
        </div>
        <div v-if="columns && data" class="space-y-2 mb-2">
          <div class="flex flex-row flex-wrap justify-center gap-x-1">
            <h2 class="text-xl font-medium">Activated Features</h2>
            <RouterLink :to="{ name: 'Search', params: { model }, query: { smi: validSmiles } }" target="_blank">
              <SquareArrowOutUpRight class="size-3"/>
            </RouterLink>
          </div>
          <div class="w-full">
            <ActivationTable :columns :data />
          </div>
        </div>
      </div>
    </CollapsibleContent>
  </div>
</template>

<style scoped>
:deep(button) {
  padding: 0;
  width: 100%;
  height: 100%;
  border: none;

  svg {
    justify-self: center;
    width: 100%;
    height: 100%;
  }
}
</style>