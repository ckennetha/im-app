import { DEFAULT_CONTINUOUS_CMAP, mapColorContinuous } from "./colors"
import type { AtomIdx, BondIdx, Token } from "./tokenize"

// types
export interface SVGOptions {
  atoms: AtomIdx[];
  bonds: BondIdx[];
  highlightAtomColors: Record<AtomIdx, number[]>;
  highlightBondColors: Record<BondIdx, number[]>;
}

export interface ColorOutput {
  colorHexTokens: string[];
  svgOptionsString?: string;
}

// utils
export function activationToColor(
  tokens: Token[], activations: number[], toSVG: boolean
): ColorOutput {
  const svgOptions: SVGOptions = {
    atoms: [],
    bonds: [],
    highlightAtomColors: {},
    highlightBondColors: {}
  }

  const colorHexTokens = activations.map((act, tkIdx) => {
    const tk = tokens[tkIdx]
    const cToken = mapColorContinuous(act, DEFAULT_CONTINUOUS_CMAP)
    
    if (toSVG && act !== 0) {
      const { r, g, b, a } = cToken.toRgb()
      const rgbArr: number[] = [r / 255, g / 255, b / 255, a]
      
      if (tk.type === 'atom') {
        svgOptions.atoms.push(tk.typeIndex!)
        svgOptions.highlightAtomColors[tk.typeIndex!] = rgbArr
      } else if (tk.type === 'bond') {
        svgOptions.bonds.push(tk.typeIndex!)
        svgOptions.highlightBondColors[tk.typeIndex!] = rgbArr
      }
    }
    return cToken.toHexString()
  })
  
  if (toSVG) {
    const svgOptionsString = JSON.stringify(svgOptions)
    return { colorHexTokens, svgOptionsString }
  }
  return { colorHexTokens }
}