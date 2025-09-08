import type { MoleculeSmiles } from "@/store"
import type { Token } from "@/utils/tokenize"
import { activationToColor } from "@/utils/visualizer"

import type { RDKitModule } from "@rdkit/rdkit"
import { shallowRef, type ShallowRef } from "vue"

// types
interface VisualizerObject {
  colorHexTokens: string[];
  svg2DString?: string;
}

interface VisualizerOutput {
  activationsPerFeature: ShallowRef<number[]>;
  visObject: ShallowRef<VisualizerObject>;
  makeVisual: (
    canonSmiles: MoleculeSmiles, tokens: Token[], RDKit?: RDKitModule
  ) => void;
}

export default function useVisualizer(use2D: boolean=false): VisualizerOutput {
  // state
  const activationsPerFeature = shallowRef<number[]>([])
  const visObject = shallowRef<VisualizerObject>({ colorHexTokens: [] })
  
  // handler
  function makeVisual(
    canonSmiles: MoleculeSmiles, tokens: Token[], RDKit?: RDKitModule
  ) {
    const { colorHexTokens, svgOptionsString } = activationToColor(
      tokens, activationsPerFeature.value, use2D
    )
  
    if (use2D && RDKit) {    
      // 2D handler
      function svg2DGenerator (svgOptionsString: string) {
        const mol = RDKit!.get_mol(canonSmiles)
        const svg2DString = mol!.get_svg_with_highlights(svgOptionsString)
        mol!.delete()
        return svg2DString
      }
    
      const svg2DString = svg2DGenerator(svgOptionsString!)
      visObject.value = { colorHexTokens, svg2DString }
    } else visObject.value = { colorHexTokens }
  }
  return { activationsPerFeature, visObject, makeVisual }
}