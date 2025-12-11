<script setup lang="ts">
import { computed, ref, reactive, watch, nextTick, onMounted } from "vue"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Collapsible } from "@/components/ui/collapsible"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"

import { MoleculeCard, MoleculeInput } from "./molecule"

import useKetcher from "@/composables/useKetcher"
import { useFromRouteStore, useMoleculeStore, type Molecule } from "@/store"

import { Models, type ModelKey } from "@/config"
import { cn } from "@/lib/utils"
import { inference } from "@/utils/inference"

import { DEFAULT_EXPLORE_MOLECULE_MAX } from "@/defaults"

const props = defineProps<{ model: ModelKey, feature: number }>()

// states
const doInference = computed<boolean>(() => Models[props.model].doInference)

const fromRouteStore = useFromRouteStore()
const moleculeStore = useMoleculeStore()
const packedMolecule = ref<Molecule[] | null>(null)

const countStatus = reactive({ activeRenders: 0, queuedRenders: 0 })

const isPacking = ref<boolean>(false)
const isLoading = computed<boolean>(() => isPacking.value || countStatus.activeRenders > 0)
const hasNoMolecules = computed<boolean>(() => moleculeStore.countMolecule === 0)

// ketcher handler
// state
const useMoleculeDrawer = ref<boolean>(false)
const { statusKetcher, onDrawToSmiles } = useKetcher()

// utils
async function packInputMolecule() {
  isPacking.value = true
  try {
    packedMolecule.value = null
    await nextTick()
    packedMolecule.value = moleculeStore.parseMolecule()
  } finally { isPacking.value = false }
}

const onQueued = () => { countStatus.queuedRenders += 1 }
const onCardLoading = (val: boolean) => {
  countStatus.activeRenders += val ? 1 : -1
  if (countStatus.activeRenders < 0) {
    countStatus.activeRenders = 0
  }
}

onMounted(async () => {
  const fromRoute = fromRouteStore.fromRoute
  if (fromRoute) {
    if (fromRoute.name === "Search" && fromRoute.query.smi) {
      await packInputMolecule()
    }
  }
})

watch(
  [() => countStatus.activeRenders, () => countStatus.queuedRenders],
  async ([actives, queues]) => {
    if (actives > 0 && actives === queues) {
      await inference.flush(props.model)
      countStatus.queuedRenders = 0
    }
  }
)
</script>

<template>
  <div class="space-y-3 w-full text-left">
    <div class="flex flex-1 flex-nowrap items-center justify-between gap-x-5">
      <h1 class="text-3xl font-medium">Try It Yourself!</h1>
      <div class="flex items-center gap-x-3">
        <Switch id="molecule-mode" v-model="useMoleculeDrawer" class="!p-0 !rounded-xl data-[state=checked]:!bg-ring" />
        <Label for="molecule-mode">
          {{ useMoleculeDrawer ? "Draw": "Write" }} a molecule
        </Label>
      </div>
    </div>
    <MoleculeInput
      v-model="moleculeStore.rawMolecule"
      v-model:limitReached="statusKetcher.isLimitReached"
      :useMoleculeDrawer
      :count="moleculeStore.countMolecule"
      :maxMolecules="DEFAULT_EXPLORE_MOLECULE_MAX"
    />
    <div :class="cn('flex items-center w-full', useMoleculeDrawer && 'justify-end sm:justify-between')">
      <div :class="cn('flex gap-x-2', useMoleculeDrawer && 'hidden sm:flex')">
        <Button :disabled="hasNoMolecules || isLoading" @click="moleculeStore.setMolecule('')">
          Clear
        </Button>
        <Button v-if="doInference" variant="secondary"
          :disabled="hasNoMolecules || statusKetcher.isKetcherBusy || isLoading"
          @click="packInputMolecule"
        >
          <Spinner v-if="isLoading" class="size-4 !text-background" />
          {{ isLoading ? 'Loading...' : 'Submit' }}
        </Button>
      </div>
      <Button v-if="useMoleculeDrawer" variant="secondary" class="justify-items-end"
        :disabled="statusKetcher.isKetcherBusy || isLoading"
        @click="onDrawToSmiles(moleculeStore)"
      >
        to SMILES
      </Button>
    </div>
    <div v-if="packedMolecule && doInference" class="grid molecule-grid gap-3 my-5 w-full">
      <Collapsible v-for="(pMol, idx) in packedMolecule" :key="idx">
        <MoleculeCard
          :model="model"
          :feature="feature"
          :id="pMol.id"
          :smi="pMol.smiles"
          @loading="onCardLoading"
          @running-inference="onQueued"
        />
      </Collapsible>
    </div>
    <Alert v-if="!doInference" class="warn justify-items-center text-center">
      <AlertTitle>This model is not available for inference.</AlertTitle>
      <AlertDescription>Try MOL-1-3072-128 or MOL-9-3072-128.</AlertDescription>
    </Alert>
  </div>
</template>