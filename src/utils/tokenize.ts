// types
export const coreTokenTypes = [
  "Atom", "Bond", "Ring", "Branch", "Disconnection"
]
export type CoreTokenType = typeof coreTokenTypes[number]

export type AtomIdx = number
export type BondIdx = number

export interface Token {
  token: string;
  type: CoreTokenType;
  typeIndex: AtomIdx | BondIdx | null;
}
export interface Edges {
  atomPairs: Array<[AtomIdx, AtomIdx]>;
  bondTokenIdx: number[];
}

const PTRNS = {
  Main: /\[[^\]]+\]|Br?|Cl?|\%[0-9]{2}|N|O|S|P|F|I|b|c|n|o|s|p|\(|\)|\.|=|#|-|\+|\\|\/|:|~|@|\?|>|\*|\$|[0-9]/g,
  Atom: /\[[^\]]+]|Br?|Cl?|N|O|S|P|F|I|b|c|n|o|s|p|\*/,
  Bond: /^[-=#\\/]$/,
  Ring: /^%[0-9]{2}$|^[0-9]$/
}

// util
export function tokenize(smi: string): {
  tokens: Token[], edges: Edges
} {
  const ptrn = PTRNS.Main
  ptrn.lastIndex = 0

  const tokens: Token[] = []
  const edges: Edges = { atomPairs: [], bondTokenIdx: [] }

  let tokenIdx = 0
  let atomIdx = 0
  let prevIsBond = false
  let pendingEdgeIdx = -1

  let currentAtomIdx = -1
  const branchStack: number[] = []

  const ringOpens = new Map<string, { atomIdx: number; bondTokenIdx: number }>()

  let match: RegExpExecArray | null
  while ((match = ptrn.exec(smi)) !== null) {
    const token = match[0]
    let tokenType: CoreTokenType | undefined
    let typeIndex: number | null = null
    
    if (PTRNS.Atom.test(token)) {
      tokenType = 'Atom'
      typeIndex = atomIdx++
      if (prevIsBond) {
        edges.atomPairs[pendingEdgeIdx][1] = typeIndex
        prevIsBond = false
        pendingEdgeIdx = -1
      }
      currentAtomIdx = typeIndex
    }

    else if (token === '(' || token === ')') {
      tokenType = 'Branch'
      if (token === '(') {
        branchStack.push(currentAtomIdx)
      } else {
        currentAtomIdx = branchStack.pop()!
      }
    }

    else if (PTRNS.Bond.test(token)) {
      tokenType = 'Bond'
      pendingEdgeIdx = edges.atomPairs.length
      edges.atomPairs.push([currentAtomIdx, -1])
      edges.bondTokenIdx.push(tokenIdx)
      prevIsBond = true
    }

    else if (PTRNS.Ring.test(token)) {
      let ringBondTokenIdx = -1
      if (prevIsBond) {
        edges.atomPairs.pop()
        ringBondTokenIdx = edges.bondTokenIdx.pop()!
        prevIsBond = false
        pendingEdgeIdx = -1
      }

      if (ringOpens.has(token)) {
        const open = ringOpens.get(token)!
        const bti = open.bondTokenIdx !== -1 ? open.bondTokenIdx : ringBondTokenIdx
        edges.atomPairs.push([open.atomIdx, currentAtomIdx])
        edges.bondTokenIdx.push(bti)
        ringOpens.delete(token)
      } else {
        ringOpens.set(token, { atomIdx: currentAtomIdx, bondTokenIdx: ringBondTokenIdx })
      }
    }

    const type: CoreTokenType = tokenType ?? 'Disconnection'
    tokens.push({ token, type, typeIndex })
    tokenIdx++
  }
  return { tokens, edges }
}