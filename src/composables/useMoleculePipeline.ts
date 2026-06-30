import { ref, shallowRef, type Ref, type ShallowRef } from "vue"
import { xxhash64 } from "hash-wasm"
import { get } from "idb-keyval"
import type { RDKitModule } from "@rdkit/rdkit"

import type { ModelKey } from "@/config"
import type { MoleculeSmiles } from "@/store"
import type { Token } from "@/utils/tokenize"

import { moleculeToTokens, getBondInfo, type BondRDKit } from "@/utils/pipeline"
import { activationsCache, inference, type FeatureIdx, type TokenActivations } from "@/utils/inference"

// types
export type PipelineStage = "idle" | "tokenizing" | "running-inference" | "visualizing"

interface ProcessOutput {
  smiles: MoleculeSmiles;
  bondInfo: BondRDKit[];
}

interface PipelineOutput {
  isSmilesInvalid: Ref<boolean>;
  statusPipeline: Ref<PipelineStage>;
  validSmiles: Ref<MoleculeSmiles | null>;
  tokens: ShallowRef<Token[]>;
  activations: ShallowRef<Record<FeatureIdx, TokenActivations> | null>;
  processor: (
    smi: MoleculeSmiles, model: ModelKey, RDKit: RDKitModule, canonicalize?: boolean
  ) => Promise<void>;
}

// utils
async function fetchFromCache(model: ModelKey, smi: MoleculeSmiles):
  Promise<Record<FeatureIdx, TokenActivations> | null> {
    const key = String(await xxhash64(`${model}:${smi}`))
    return await get(key, activationsCache) ?? null
  }


export function useMoleculePipeline(withInference: boolean=false): PipelineOutput {
  // status
  const isSmilesInvalid = ref<boolean>(false)
  const statusPipeline = ref<PipelineStage>("idle")

  // states
  const validSmiles = ref<MoleculeSmiles | null>(null)
  const tokens = shallowRef<Token[]>([])
  const activations = shallowRef<
    Record<FeatureIdx, TokenActivations> | null>(null)
  
  // handler
  function processSmilesWithBondInfo (
    RDKit: RDKitModule, smi: string, canonicalize: boolean
  ): ProcessOutput | null {
      const mol = RDKit.get_mol(smi)
      if (!mol) {
        isSmilesInvalid.value = true
        return null
      }
      const smiles = canonicalize ? mol.get_smiles() : smi
      const bondInfo = getBondInfo(mol)
      mol.delete()
      return { smiles, bondInfo }
  }

  // async processor
  async function processor(
    smi: MoleculeSmiles, model: ModelKey, RDKit: RDKitModule, canonicalize: boolean=true
  ): Promise<void> {
    isSmilesInvalid.value = false
    
    const out = processSmilesWithBondInfo(RDKit, smi, canonicalize)
    if (!out) return
    const { smiles, bondInfo } = out
    
    validSmiles.value = smiles
    statusPipeline.value = "tokenizing"
    tokens.value = moleculeToTokens(smiles, bondInfo)

    if (!withInference) return

    const cacheKey = validSmiles.value!
    activations.value = await fetchFromCache(model, cacheKey)
    if (!activations.value) {
      inference.addQueue(cacheKey)
      statusPipeline.value = "running-inference"
      await inference.whenReady(cacheKey)

      activations.value = await fetchFromCache(model, cacheKey)
      if (!activations.value) {
        throw new Error("Activations cannot be computed.")
      }
    }
  }
  
  return {
    isSmilesInvalid,
    statusPipeline,
    validSmiles,
    tokens,
    activations,
    processor,
  }
}