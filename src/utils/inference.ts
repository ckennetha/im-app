import type { ModelKey } from "@/config"
import type { MoleculeSmiles } from "@/store"

import { xxhash64 } from "hash-wasm"
import { keys, setMany, createStore, type UseStore } from "idb-keyval"

// types
export type FeatureIdx = string

export interface TokenActivations {
  data: number[];
  indices: number[];
}

export interface RunPodInferenceInput {
  sae_name: ModelKey;
  smiles: MoleculeSmiles[];
}

// cache
export const activationsCache: UseStore = createStore("activations", "cache")

// functions
async function postRunpod(input: RunPodInferenceInput):
  Promise<Record<string, Record<FeatureIdx, TokenActivations>>> {
  try {
    const response = await fetch(
      `https://api.runpod.ai/v2/yvh33ipsb7ug9x/runsync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_RUNPOD_API_KEY}`
        },
        body: JSON.stringify({ input })
      }
    )

    if (!response.ok) {
      throw new Error(`Network error! Status: ${response.status}`)
    }

    const resp = await response.json()
    if (!resp.output?.result) {
      throw new Error("Invalid response format from RunPod API")
    }

    return resp.output.result
  } catch (err) {
    console.error("Error:", err)
    throw err
  }
}

function deferVoid() {
  let resolve!: () => void
  let reject!: (e?: any) => void
  const promise = new Promise<void>((res, rej) => { resolve = res, reject = rej })
  return { promise, resolve, reject }
}

function cacheInference() {
  const queue = new Set<MoleculeSmiles>()
  const waiters = new Map<
    MoleculeSmiles, ReturnType<typeof deferVoid>
  >()
  let isFlushing = false
  
  function addQueue(smi: MoleculeSmiles) {
    queue.add(smi)
    if (!waiters.has(smi)) { waiters.set(smi, deferVoid()) }
  }

  function whenReady(smi: MoleculeSmiles) {
    return waiters.get(smi)!.promise
  }

  async function flush(sae_name: ModelKey) {
    if (isFlushing || queue.size === 0) { return false }
    isFlushing = true

    const smiles = [...queue]
    queue.clear()

    try {
      const result = await postRunpod({ sae_name, smiles })
      const pairs: [IDBValidKey, Record<FeatureIdx, TokenActivations>][] = await Promise.all(
        Object.entries(result).map(
          async ([id, acts]) => {
            const hashedKey: IDBValidKey = await xxhash64(id)
            return [hashedKey, acts] as const
        })
      )
      await setMany(pairs, activationsCache)

      for (const id of Object.keys(result)) {
        const idSmi = id.split(":")[1]
        const waiter = waiters.get(idSmi)
        if (waiter) {
          waiter.resolve()
          waiters.delete(idSmi)
        }
      }
      return true
    } catch (err) {
      for (const smi of smiles) {
        const waiter = waiters.get(smi);
        if (waiter) {
          waiter.reject(err)
          waiters.delete(smi)
        }
      }
      console.error("Error:", err)
    } finally {
      isFlushing = false
    }
  }
  return { addQueue, whenReady, flush }
}

export const inference = cacheInference()

// utils
export async function hasKey(key: string): Promise<boolean> {
  const allKeys = await keys()
  return allKeys.includes(key)
}