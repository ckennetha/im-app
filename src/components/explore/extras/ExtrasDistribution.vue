<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ChartColumn } from 'lucide-vue-next'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select/index.ts'
import ExtrasDistributionChart from "./ExtrasDistributionChart.vue"

import type { FeatureSample } from '../molecule'
import type { Token } from '@/utils/tokenize'
import type { TokenActivation } from "."

import initRDKit from '@/utils/initRDKit'
import { getBondInfo, moleculeToTokens } from '@/utils/pipeline'

const { samples } = defineProps<{ samples: Record<string, FeatureSample[]> }>()

// state
const open = ref<boolean>(false)
const chartBuilt = ref<boolean>(false)
const activationData = ref<TokenActivation[]>([])

let tokenOpts: string[] = []
const seleToken = ref<string | null>(null)

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
      const mol = RDKit.get_mol(smiles)
      const bondInfo = getBondInfo(mol!)
      const tokens: Token[] = moleculeToTokens(smiles, bondInfo)
      mol!.delete()
 
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
  activationData.value = data

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
      <div class="text-base font-medium">Activation</div>
      <Select
        :model-value="seleToken ?? ''"
        @update:model-value="seleToken = $event === '__all__' ? null : ($event as string)"
      >
        <div class="flex flex-row gap-x-3">
          <Label for="token">Select a token:</Label>
          <SelectTrigger id="token" class="!h-7 !text-xs !bg-background shadow-none">
            <SelectValue placeholder="--" />
          </SelectTrigger>
        </div>
        <SelectContent>
          <SelectItem value="__all__" class="text-xs">--</SelectItem>
          <SelectItem v-for="token in tokenOpts" :key="token" :value="token" class="text-xs">
            {{ token }}
          </SelectItem>
        </SelectContent>
      </Select>
      <ExtrasDistributionChart :data="activationData" :seleToken />
    </PopoverContent>
  </Popover>
</template>