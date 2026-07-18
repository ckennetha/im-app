<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ChartColumn } from 'lucide-vue-next'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select/index.ts'
import { Separator } from '@/components/ui/separator'
import ExtrasDistributionChart from "./ExtrasDistributionChart.vue"

import type { FeatureSample } from '../molecule'
import type { Token } from '@/utils/tokenize'
import type { TokenActivation } from "."

import { Models } from '@/config'
import useModelParam from '@/composables/useModelParam'
import initRDKit from '@/utils/initRDKit'
import { getBondInfo, moleculeToTokens } from '@/utils/pipeline'
import { tokenizeBPE } from '@/utils/tokenizeBPE'

const { samples } = defineProps<{ samples: Record<string, FeatureSample[]> }>()

// type
interface DistStats {
  Minimum: number;
  Maximum: number;
  Median: number;
  Average: number;
}

// state
const model = useModelParam()
const useBPE = Models[model.value]?.baseModel === "ChemBERTa"

const open = ref<boolean>(false)
const chartBuilt = ref<boolean>(false)
const activationData = ref<TokenActivation[]>([])

let tokenOpts: string[] = []
const seleToken = ref<string[]>([])

// workflow-utils
const expandActivations = (sparse: [number, number][], length: number): number[] => {
  const dense = new Array(length).fill(0)
  for (const [idx, val] of sparse) { dense[idx] = val }
  return dense
}
 
async function collectTokenActivations(): Promise<TokenActivation[]> {
  const RDKit = await initRDKit()
  const collected: TokenActivation[] = []

  for (const group of Object.values(samples)) {
    for (const { smiles, activations } of group) {
      let tokens: Token[]
      if (useBPE) {
        tokens = await tokenizeBPE(smiles)
      } else {
        const mol = RDKit.get_mol(smiles)
        const bondInfo = getBondInfo(mol!)
        tokens = moleculeToTokens(smiles, bondInfo)
        mol!.delete()
      }

      const dense = expandActivations(activations, tokens.length)
      dense.forEach((val, idx) => {
        if (val !== 0) {
          collected.push({ token: tokens[idx].token, activation: val })
        }
      })
    }
  }
 
  return collected
}
 
async function buildDistribution() {
  if (chartBuilt.value) return
 
  const data = await collectTokenActivations()
  activationData.value = [...data].sort((a, b) => a.activation - b.activation)

  const counts = new Map<string, number>()
  for (const { token, activation } of data) {
    if (activation > 0.2) {
      counts.set(token, (counts.get(token) ?? 0) + 1)
    }
  }
  tokenOpts = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([token]) => token)

  chartBuilt.value = true
}

const stats = computed((): DistStats | null => {
  const values = (seleToken.value.length
    ? activationData.value.filter((d) => seleToken.value.includes(d.token))
    : activationData.value
  ).map((d) => d.activation)

  if (!values.length) return null

  const Minimum = values[0]
  const Maximum = values[values.length - 1]
  
  const mid = Math.floor(values.length / 2)
  const Median = values.length % 2 === 0
    ? (values[mid - 1] + values[mid]) / 2
    : values[mid]

  const Average = values.reduce((s, v) => s + v, 0) / values.length

  return { Minimum, Maximum, Median, Average }
})
 
onMounted(() => { buildDistribution() })
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button :disabled="!chartBuilt" size="icon" class="size-5 !px-0 !pt-1 !pb-0 !border-none !shadow-none hover:!bg-background disabled:opacity-40">
        <ChartColumn class="size-5 text-muted-foreground" />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="mt-1 mx-3 space-y-3 w-76">
      <div class="text-base font-medium">Activation Histogram</div>
      <div class="space-y-1">
        <Select
          multiple
          :model-value="seleToken"
          @update:model-value="seleToken = $event as string[]"
        >
          <div class="flex flex-row">
            <Label for="token" class="basis-2/5">Select a token:</Label>
            <SelectTrigger id="token" class="basis-3/5 !h-7 !text-xs !bg-background shadow-none">
              <SelectValue placeholder="--" class="max-w-26"/>
            </SelectTrigger>
          </div>
          <SelectContent side="bottom" class="max-h-[172px]">
            <SelectItem v-for="token in tokenOpts" :key="token" :value="token" class="text-xs">
              {{ token }}
            </SelectItem>
          </SelectContent>
        </Select>
        <ExtrasDistributionChart :data="activationData" :seleToken />
      </div>
      <Separator />
      <div v-if="stats" class="grid grid-cols-4 gap-1 text-xs text-muted-foreground">
        <div v-for="key in Object.keys(stats) as (keyof DistStats)[]" :key
          class="flex flex-col items-center"
        >
          <div>{{ key }}</div>
          <div class="pt-1 font-medium text-foreground">
            {{ stats[key as keyof DistStats].toFixed(3) }}
          </div>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>