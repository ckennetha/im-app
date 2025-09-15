import type { MoleculeSmiles } from "@/store"

import type { AtomIdx, Token, Edges } from "./tokenize"
import { tokenize } from "./tokenize"

import type { JSMol } from "@rdkit/rdkit"

// types
export interface BondRDKit {
  atoms: [AtomIdx, AtomIdx];
  bo?: number;
}

// utils
function mapToBondIdx(
  bondInfo: BondRDKit[], edges: Edges
): Map<number, number> {
  const bondsMap = new Map<number, number>()

  const pairKey = (a: number, b: number) => (
    a < b ? `${a}-${b}` : `${b}-${a}`
  )

  const bondIdxByPair: Map<string, number> = new Map()
  bondInfo.forEach((bond, bondIdx) => {
    const [at0, at1] = bond.atoms
    bondIdxByPair.set(pairKey(at0, at1), bondIdx)
  })

  edges.bondTokenIdx.forEach((bondTokenIdx, edgeIdx) => {
    const [at0, at1] = edges.atomPairs[edgeIdx]
    const bondIdx = bondIdxByPair.get(pairKey(at0, at1))

    bondsMap.set(bondTokenIdx, bondIdx!)
  })
  return bondsMap
}

function moleculeToTokens(
  smi: MoleculeSmiles, bondInfo: BondRDKit[]
): Token[] {
  const { tokens, edges } = tokenize(smi)
  if (edges.bondTokenIdx.length > 0) {
    const bondsMap = mapToBondIdx(bondInfo, edges)
    bondsMap.forEach((bIdx, bTIdx) => {
      tokens[bTIdx] = { ...tokens[bTIdx], typeIndex: bIdx }
    })
  }
  return tokens
}

function getBondInfo(mol: JSMol): BondRDKit[] {
  const { molecules } = JSON.parse(mol.get_json())
  const bondInfo = molecules[0].bonds
  return bondInfo
}

export { mapToBondIdx, moleculeToTokens, getBondInfo }