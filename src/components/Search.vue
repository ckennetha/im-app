<script setup lang="ts">
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import { MoleculeInput } from "./exp/molecule"
import ExploreSidebar from "./ExploreSidebar.vue"
import SearchMolecule from "./SearchMolecule.vue"

import useSearchPath from "@/composables/useSearchPath"
import useKetcher from "@/composables/useKetcher"
import { useMoleculePipeline } from "@/composables/useMoleculePipeline"
import { Models } from "@/config"

import initRDKit from "@/utils/initRDKit"
import { inference } from "@/utils/inference"

import { xxhash64 } from "hash-wasm"
import { LoaderCircle } from "lucide-vue-next"
import { ref, computed, watch } from "vue"
import { useRoute } from "vue-router"

const route = useRoute()

// composables
const { model, pushQuery } = useSearchPath()

const { statusKetcher, onDrawToSmiles } = useKetcher()
const {
  isSmilesInvalid,
  statusPipeline,
  canonSmiles,
  tokens,
  activations,
  processor,
} = useMoleculePipeline(true)

// state
const doInference = computed<boolean>(() =>
  Models[model.value].doInference)

const useMoleculeDrawer = ref<boolean>(false)
const idMolecule = ref<string>("")
const rawSmi = ref<string>("")

// utils
async function wrapperProcessor(smi: string) {
  try {
    isSmilesInvalid.value = false
    statusPipeline.value = "tokenizing"

    // reset
    canonSmiles.value = null
    tokens.value = []
    activations.value = null

    idMolecule.value = await xxhash64(`${model}:${smi}`)

    const RDKit = await initRDKit()
    await processor(smi, model.value, RDKit)

    if (!tokens.value) {
      throw new Error("Invalid SMILES string!")
    }
  } catch(err) {
    console.error("Error:", err)
  } finally {
    statusPipeline.value = "idle"
  }
}

async function searchFeatures() {
  if (useMoleculeDrawer.value) {
    await onDrawToSmiles(rawSmi)
  }
  pushQuery({ smi: rawSmi.value })
}

watch(() => model.value, () => {
  isSmilesInvalid.value = false
  activations.value = null
})

watch(() => route.query.smi, async () => {
  if (doInference.value) {
    if (route.query.smi) {
      const smi = String(route.query.smi)
      if (rawSmi.value !== smi) { rawSmi.value = smi }
      await wrapperProcessor(rawSmi.value)
    } else {
      rawSmi.value = ""
      activations.value = null
    }
  }
}, { immediate: true })

watch(() => statusPipeline.value, async () => {
  if (statusPipeline.value === "running-inference") {
    await inference.flush(model.value)
  }
})
</script>

<template>
  <ExploreSidebar>
    <div class="flex flex-col items-center justify-center space-y-8 h-full">
      <div class="flex flex-col mx-auto w-full max-w-180">
        <h1 class="text-3xl font-medium">
          {{ `Search features of ${model}` }}
        </h1>
        <div class="flex flex-1 justify-center gap-x-3 mt-3">
          <Switch id="molecule-mode" v-model="useMoleculeDrawer"
            class="!p-0 !rounded-xl data-[state=checked]:!bg-ring"
          />
          <Label for="molecule-mode">
            {{ useMoleculeDrawer ? "Draw": "Write" }} a molecule
          </Label>
        </div>
        <MoleculeInput
          v-model="rawSmi"
          v-model:limitReached="statusKetcher.isLimitReached"
          :useMoleculeDrawer
          class="mt-5"
        >
        </MoleculeInput>
        <div class="mt-3">
          <Button
            v-if="doInference"
            variant="secondary"
            class="justify-center w-full"
            :disabled="!doInference || statusPipeline !== 'idle'"
            @click="searchFeatures"
          >
            <LoaderCircle v-if="statusPipeline !== 'idle'"
              class="size-4 !text-background animate-spin"
            />
            {{ statusPipeline === 'idle' ? 'Search' : 'Loading...' }}
          </Button>
          <Alert v-else class="warn justify-items-center text-center">
            <AlertTitle>This model is not available for inference.</AlertTitle>
            <AlertDescription>Try MOL-1-3072-128 or MOL-9-3072-128.</AlertDescription>
          </Alert>
        </div>
        <Alert v-if="isSmilesInvalid"
          class="mx-auto mt-5 w-1/2 text-center bg-[#f3cfd3] border border-[#f4bbbf]"
        >
          <AlertTitle>Invalid SMILES string!</AlertTitle>
        </Alert>
      </div>
      <div v-if="activations" class="w-full">
        <SearchMolecule
          :id="idMolecule"
          :tokens
          :activations
          isInSearch
        />
      </div>
    </div>
  </ExploreSidebar>
</template>