<script setup lang="ts">
import { CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Label } from "@/components/ui/label"
import { TooltipProvider } from "@/components/ui/tooltip"
import { TokenVisualizer } from "."
import ActsTable from "../activation/ActsTable.vue"

import type { ModelKey } from "@/config"
import initRDKit from "@/utils/initRDKit"

import type { FlatFeatureActivations } from "../activation/columns"
import { createActColumns, toFlatFeatureActivations } from "../activation/columns"
import { useMoleculePipeline, type PipelineStage } from "@/composables/useMoleculePipeline"
import useVisualizer from "@/composables/useVisualizer"

import type { ColumnDef } from "@tanstack/vue-table"
import { shallowRef, watch, onMounted } from "vue"
import { SquareArrowOutUpRight } from "lucide-vue-next"

const props = defineProps<{
  model: ModelKey;
  feature: number;
  id: string;
  smi: string;
}>()

const emit = defineEmits<{
  (e: 'loading', v: boolean): void;
  (e: PipelineStage): void;
}>()

// state
const columns = shallowRef<ColumnDef<FlatFeatureActivations>[]>()
const actedFeatures = shallowRef<FlatFeatureActivations[] | null>(null)

// composables
const {
  isSmilesInvalid,
  statusPipeline,
  canonSmiles,
  tokens,
  activations,
  processor,
} = useMoleculePipeline(true)

const { activationsPerFeature, visObject, makeVisual } = useVisualizer(true)

// utils
function getActivationsPerFeature() {
  const featureActivations = activations.value?.[String(props.feature)]
  const tmpActivations = new Array(tokens.value?.length).fill(0.0)
  if (featureActivations) {
    const { data, indices } = featureActivations
    indices.forEach((tkIdx, idx) => {
      tmpActivations[tkIdx] = data[idx]
    })
  }
  activationsPerFeature.value = tmpActivations
}

onMounted(async () => {
  try {
    statusPipeline.value = "tokenizing"
    emit('loading', true)
    const RDKit = await initRDKit()
    await processor(props.smi, props.model, RDKit)

    if (!tokens.value) {
      throw new Error("Invalid SMILES string!")
    }

    if (!activations.value) {
      throw new Error("No activation data.")
    }

    getActivationsPerFeature()
    statusPipeline.value = "visualizing"
    makeVisual(canonSmiles.value!, tokens.value, RDKit)

    columns.value = createActColumns(tokens.value, false)
    actedFeatures.value = toFlatFeatureActivations(
      activations.value
    )
  } catch (err) {
    console.error("Error:", err)
  } finally {
    emit('loading', false)
    statusPipeline.value = "idle"
  }
})

watch([() => props.model, () => props.feature], async (
  [newModel], [oldModel]
) => {
  try {
    // reset
    statusPipeline.value = "tokenizing"
    emit('loading', true)

    const RDKit = await initRDKit()
    if (newModel !== oldModel) {
      actedFeatures.value = null
      await processor(props.smi, newModel, RDKit)

      if (!activations.value) {
        throw new Error("No activation data.")
      }
      
      columns.value = createActColumns(tokens.value, false)
      actedFeatures.value = toFlatFeatureActivations(
        activations.value
      )
    }

    getActivationsPerFeature()
    statusPipeline.value = "visualizing"
    makeVisual(canonSmiles.value!, tokens.value!, RDKit)
  } catch (err) {
    console.error('Error:', err)
  } finally {
    emit('loading', false)
    statusPipeline.value = "idle"
  }
})

watch(statusPipeline, (newStage) => {
  emit(newStage)
})
</script>

<template>
  <div
    :id="id"
    :class="[
      'aspect-square border rounded-md shadow-xs hover:ring-1',
      isSmilesInvalid
        ? 'bg-[#f3cfd3] border-[#f4bbbf] hover:ring-[#a1313b]'
        : 'hover:ring-ring/50'
    ]"
  >
    <CollapsibleTrigger as-child>
      <div v-if="statusPipeline === 'idle'" class="relative w-full h-full">
        <Label
          :class="[
            'absolute inline-block top-0 left-0 max-w-3/4 px-3 py-2',
            'bg-foreground/5 rounded-tl-md truncate cursor-pointer',
            isSmilesInvalid ? 'pointer-events-none' : ''
          ]"
        >
          {{ id }}
        </Label>
        <button
          :aria-label="`Show ${id}`"
          :disabled="isSmilesInvalid"
        >
          <template v-if="!isSmilesInvalid">
            <img v-if="!isSmilesInvalid"
              :src="`data:image/svg+xml;charset=utf-8,${encodeURIComponent(visObject?.svg2DString!)}`"
              :alt="`${id}`"
              class="w-full h-full object-contain"
            >
          </template>
          <p v-else
            class="col-start-2 line-clamp-1 min-h-4 text-base font-medium tracking-tight"
          >
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
      <div class="space-y-5 px-5 pb-3 text-center">
        <div class="space-y-2">
          <h2>Canonical SMILES</h2>
          <div class="w-full overflow-x-auto">
            <div class="inline-flex flex-nowrap">
              <TooltipProvider>
                <TokenVisualizer 
                  :tokens="tokens"
                  :activations="activationsPerFeature"
                  :color-hex-tokens="visObject.colorHexTokens"
                />
              </TooltipProvider>
            </div>
          </div>
        </div>
        <div v-if="columns && actedFeatures" class="space-y-2 mb-2">
          <div class="flex flex-row flex-wrap justify-center gap-x-1">
            <h2>Activated Features</h2>
            <RouterLink :to="{ name: 'Search', params: { model }, query: { smi: canonSmiles } }">
              <SquareArrowOutUpRight class="size-3"/>
            </RouterLink>
          </div>
          <div class="w-full">
            <ActsTable :columns :data="actedFeatures" />
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

h2 {
  font-size: var(--text-xl);
  font-weight: 500;
  line-height: var(--text-xl--line-height);
}
</style>