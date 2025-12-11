<script setup lang="ts">
import { shallowRef, ref, onMounted, watch } from "vue"
import type { RDKitModule } from "@rdkit/rdkit"
import type { ColumnDef, Table } from "@tanstack/vue-table"

import { Button } from "./ui/button"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./ui/resizable"

import { createActivationColumns, toFlatTokenActivation, type FlatTokenActivation } from "./explore/activation/columns"
import ActivationTable from "./explore/activation/ActivationTable.vue"
import { Molecule2DVisualizer } from "./explore/molecule"

import type { ModelKey } from "@/config"
import type { TokenActivations } from "@/utils/inference"
import type { Token } from "@/utils/tokenize"

import initRDKit from "@/utils/initRDKit"
import { activationToColor } from "@/utils/visualizer"

const props = defineProps<{
  model: ModelKey;
  smiles: string;
  tokens: Token[];
  activations: Record<string, TokenActivations>;
  isInSearchPage: boolean;
}>()

// type
interface SearchSVGVis {
  rowIdx: string;
  featureIdx: string;
  svg2DString: string;
}

// states
const columns = shallowRef<ColumnDef<FlatTokenActivation>[]>([])
const data = shallowRef<FlatTokenActivation[]>([])

const tableRef = ref<InstanceType<typeof ActivationTable>>()
const shownStructure = ref<SearchSVGVis[]>([])

let RDKit: RDKitModule | null = null

// utils
const clearAllSelection = (): void => { tableRef.value?.table.resetRowSelection() }

function getActivationsAtFeature(featureIdx: string): number[] {
  const { data, indices } = props.activations[featureIdx]
  const sparseFeatureActivations = new Array(props.tokens.length).fill(0.0)
  indices.forEach((tkIdx, idx) => { sparseFeatureActivations[tkIdx] = data[idx] })
  return sparseFeatureActivations
}

function get2DVis(RDKit: RDKitModule, activationsAtFeature: number[]): string {
  const { svgOptionsString } = activationToColor( props.tokens, activationsAtFeature, true)
  const mol = RDKit!.get_mol(props.smiles)
  const svg2DString = mol!.get_svg_with_highlights(svgOptionsString!)
  mol!.delete()
  return svg2DString
}

onMounted(() => {
  columns.value = createActivationColumns(props.tokens, true, props.model)
  data.value = toFlatTokenActivation(props.activations)
})

watch(
  () => tableRef.value?.rowSelection,
  async (newSelection) => {
    const table = tableRef.value?.table as Table<FlatTokenActivation>
    const newIds = Object.keys(newSelection ?? {})

    shownStructure.value = shownStructure.value.filter(obj => newIds.includes(obj.rowIdx))
    if (newIds.length > 0) {
      if (!RDKit) { RDKit = await initRDKit() }

      const newShownStructures = newIds
        .filter(id => !shownStructure.value.some(obj => id === obj["rowIdx"]))
        .map(id => {
          const seleRow = table.getRow(id)
          const rowFeatureIdx = seleRow.original.featureIdx

          const sparseFeatureActivations = getActivationsAtFeature(rowFeatureIdx)
          const svg2DString = get2DVis(RDKit!, sparseFeatureActivations)

          return {
            "rowIdx": id,
            "featureIdx": rowFeatureIdx,
            svg2DString
          }
        }
        )
      shownStructure.value.push(...newShownStructures)
    }
  }
)
</script>

<template>
  <ResizablePanelGroup direction="horizontal" class="gap-x-2">
    <ResizablePanel :defaultSize=60>
      <ActivationTable ref="tableRef" :columns :data :isInSearchPage="props.isInSearchPage"/>
    </ResizablePanel>
    <ResizableHandle />
    <ResizablePanel :defaultSize=40 class="relative max-h-[832.5px] border rounded-md">
      <div v-if="shownStructure.length > 0" class="overflow-y-auto h-full">
        <div class="absolute z-50 bottom-5 w-full">
          <Button variant="secondary" class="!w-21 !h-8 hover:!bg-secondary/90 !shadow-md"
            @click="clearAllSelection()"
          >
            Clear all
          </Button>
        </div>
        <div class="grid molecule-grid gap-3 m-2">
          <Molecule2DVisualizer
            v-for="(svgVis) in shownStructure"
            :key="svgVis.rowIdx"
            :id="`f/${svgVis.featureIdx}`"
            :svgString="svgVis.svg2DString"
          />
        </div>
      </div>
      <div v-else class="flex justify-center items-center h-full text-muted-foreground">
        <p class="px-2">No 2D structures are shown.</p>
      </div>
    </ResizablePanel>
  </ResizablePanelGroup>
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

.molecule-grid {
  grid-template-columns: repeat(1, 1fr);
  @media (min-width: 640px) { grid-template-columns: repeat(2, 1fr); }
  @media (min-width: 768px) { grid-template-columns: repeat(1, 1fr); }
  @media (min-width: 1024px) { grid-template-columns: repeat(2, 1fr); }
}
</style>