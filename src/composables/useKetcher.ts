import type { MoleculeStore } from "@/store"
import { reactive, isRef, type Ref } from "vue"
import { toast } from "vue-sonner"

// types
interface KetcherStatus {
  isKetcherBusy: boolean;
  isLimitReached: boolean;
}

interface KetcherOutput {
  log: string;
  smi?: string;
}

export default function useKetcher() {
  // status
  const statusKetcher = reactive<KetcherStatus>({
    isKetcherBusy: false,
    isLimitReached: false,
  })

  // handler
  async function drawToSmiles (): Promise<KetcherOutput> {
    const ketcherFrame = document.getElementById('ketcher') as any
    const ketcher = ketcherFrame.contentWindow.ketcher

    const isReaction = await ketcher.containsReaction()
    if (isReaction) {
      return {
        log: "Reaction object is not supported."
      }
    } else {
      const smi = await ketcher.getSmiles()

      if (!smi) {
        return {
          log: "No structure detected."
        }
      }

      if (statusKetcher.isLimitReached) {
        return {
          log: "Maximum number of molecules reached."
        }
      }

      await ketcher.editor.clear()
      return {
        log: "Success",
        smi: smi
      }
    }
  }

  async function onDrawToSmiles (state: MoleculeStore | Ref<string>) {
    statusKetcher.isKetcherBusy = true
    try {
      const out = await drawToSmiles()
      if (out.smi) {
        const smiFromKetcher = out.smi.trim()
        if (isRef(state)) {
          state.value = smiFromKetcher
        } else {
          state.addMolecule(smiFromKetcher)
        }
      } else {
        const [title, description = ''] = out.log.split(/(?<=\.)\s+/, 2)
        toast(title, {
          description: description,
          style: {
            background: '#fff5d5',
            border: '1px solid #fbd24c',
            color: '#ad7c2c',
          }
        })
      }
    } finally { statusKetcher.isKetcherBusy = false }
  }
  return { statusKetcher, onDrawToSmiles }
}