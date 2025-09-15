import type { ModelKey } from "@/config"
import type { MoleculeSmiles } from "@/store"

import type { Token } from "@/utils/tokenize"
import { moleculeToTokens, getBondInfo, type BondRDKit } from "@/utils/pipeline"
import {
  activationsCache,
  inference,
  type FeatureIdx,
  type TokenActivations} from "@/utils/inference"

import type { RDKitModule } from "@rdkit/rdkit"
import { xxhash64 } from "hash-wasm"
import { get } from "idb-keyval"
import { ref, shallowRef, type Ref, type ShallowRef } from "vue"

// types
export type PipelineStage = "idle"
  | "tokenizing"
  | "running-inference"
  | "visualizing"

interface canonicalizeOutput {
  validSmiles: MoleculeSmiles;
  bondInfo: BondRDKit[];
}

interface PipelineOutput {
  isSmilesInvalid: Ref<boolean>;
  statusPipeline: Ref<PipelineStage>;
  canonSmiles: Ref<MoleculeSmiles | null>;
  tokens: ShallowRef<Token[]>;
  activations: ShallowRef<Record<FeatureIdx, TokenActivations> | null>;
  processor: (
    smi: MoleculeSmiles, model: ModelKey, RDKit: RDKitModule
  ) => Promise<void>;
}

// utils
async function fetchFromCache(model: ModelKey, smi: MoleculeSmiles):
  Promise<Record<FeatureIdx, TokenActivations> | null> {
    const key = String(await xxhash64(`${model}:${smi}`))
    return await get(key, activationsCache) ?? null
  }


export function useMoleculePipeline(
  withInference: boolean=false
): PipelineOutput {
  // status
  const isSmilesInvalid = ref<boolean>(false)
  const statusPipeline = ref<PipelineStage>("idle")

  // reactive states
  const canonSmiles = ref<MoleculeSmiles | null>(null)
  const tokens = shallowRef<Token[]>([])
  const activations = shallowRef<
    Record<FeatureIdx, TokenActivations> | null>(null)
  
  // handler
  function canonicalizeSmilesWithBondInfo (RDKit: RDKitModule, smi: string):
    canonicalizeOutput | null {
      const mol = RDKit.get_mol(smi)
      if (!mol) {
        isSmilesInvalid.value = true
        return null
      }
      const validSmiles = mol.get_smiles()
      const bondInfo = getBondInfo(mol)
      mol.delete()
      return { validSmiles, bondInfo }
  }

  // async processor
  async function processor(
    smi: MoleculeSmiles, model: ModelKey, RDKit: RDKitModule
  ): Promise<void> {
    const out = canonicalizeSmilesWithBondInfo(RDKit, smi)
    
    if (!out) return
    const { validSmiles, bondInfo } = out
    
    canonSmiles.value = validSmiles
    tokens.value = moleculeToTokens(validSmiles, bondInfo)

    if (!withInference) return
    activations.value = await fetchFromCache(model, canonSmiles.value!)
    if (!activations.value) {
      inference.addQueue(canonSmiles.value!)
      statusPipeline.value = "running-inference"
      await inference.whenReady(canonSmiles.value!)

      activations.value = await fetchFromCache(model, canonSmiles.value!)
      if (!activations.value) {
        throw new Error("Activations cannot be computed")
      }
    }
  }
  
  return {
    isSmilesInvalid,
    statusPipeline,
    canonSmiles,
    tokens,
    activations,
    processor,
  }
}