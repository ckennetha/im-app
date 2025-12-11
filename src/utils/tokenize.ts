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
interface Branch {
  startTokenIdx: number;
  endTokenIdx: number;
  depth: number;
  atomInBetween: number;
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
  const edges: Edges = {
    atomPairs: [], bondTokenIdx: []
  }

  let tokenIdx = 0
  let lastToken: string = ''
  let atomIdx = 0
  let ptrAtomStack = 0
  let prevIsBond = false

  const allBranch: Branch[] = []
  const tmpBranch: Branch[] = []
  let isInBranch = false
  let ptrBranch = -1
  let ptrDepth = -1

  let match: RegExpExecArray | null
  while ((match = ptrn.exec(smi)) !== null) {
    const token = match[0]
    let tokenType: CoreTokenType | undefined
    let typeIndex = null
    
    if (PTRNS.Atom.test(token)) {
      tokenType = 'Atom'
      typeIndex = atomIdx++
      
      if (isInBranch) { tmpBranch[ptrBranch].atomInBetween++ }
      if (prevIsBond) {
        edges.atomPairs[ptrAtomStack][1] = typeIndex
        ptrAtomStack++
        prevIsBond = false
      }
    }

    if (token === '(' || token === ')') {
      tokenType = 'Branch'
      if (token === '(') {
        isInBranch = true
        ptrBranch++
        ptrDepth++

        tmpBranch.push({
          startTokenIdx: tokenIdx,
          endTokenIdx: -1,
          depth: ptrDepth,
          atomInBetween: 0
        })
      } else {
        tmpBranch[ptrBranch].endTokenIdx = tokenIdx
        allBranch.push(tmpBranch.pop()!)

        isInBranch = ptrDepth === 0 ? false : true
        ptrBranch--
        ptrDepth--
      }
    }

    if (PTRNS.Bond.test(token)) {
      tokenType = 'Bond'
      if (lastToken === ')') {
        let stepBack = allBranch.length - 1
        let passAtoms = 0
        while (stepBack >= 0) {
          const lastBranch = allBranch[stepBack]
          const tokenBeforeBranchIdx = lastBranch.startTokenIdx - 1
          passAtoms += lastBranch.atomInBetween

          if (tokens[tokenBeforeBranchIdx].token === ')') {
            stepBack--
          } else {
            edges.atomPairs[ptrAtomStack] = [
              atomIdx - passAtoms - 1, -1
            ]
            break
          }
        }
      } else {
        edges.atomPairs[ptrAtomStack] = [atomIdx - 1, -1]
      }
      edges.bondTokenIdx.push(tokenIdx)
      prevIsBond = true
    }

    const type: CoreTokenType = tokenType
      ?? (PTRNS.Ring.test(token) ? 'Ring' : 'Disconnection')
    tokens.push({ token, type, typeIndex })

    tokenIdx++
    lastToken = token
  }
  return { tokens, edges }
}