// types
export type AtomIdx = number
export type BondIdx = number

export const coreTokenTypes = [
  "atom", "bond", "ring", "branch", "disconnection"
]
export type CoreTokenType = typeof coreTokenTypes[number]
type TokenType = CoreTokenType | "other"

export interface Token {
  token: string;
  type: TokenType;
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

// default
const PATTERNS = {
  Main: /\[[^\]]+\]|Br?|Cl?|\%[0-9]{2}|N|O|S|P|F|I|b|c|n|o|s|p|\(|\)|\.|=|#|-|\+|\\|\/|:|~|@|\?|>|\*|\$|[0-9]/g,
  Atom: /[a-zA-Z]/,
  Bond: /^[-=#\\/]$/,
  Branch: /^[()]$/,
  Ring: /^%[0-9]{2}$|^[0-9]$/,
  Disconnection: /^\.$/
}

// function
export function tokenize(smi: string): {
  tokens: Token[], edges: Edges
} {
  const pattern = PATTERNS.Main
  pattern.lastIndex = 0

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
  while ((match = pattern.exec(smi)) !== null) {
    const token = match[0]
    let tokenType: TokenType | undefined
    let typeIndex = null
    
    if (PATTERNS.Atom.test(token)) {
      tokenType = 'atom'
      typeIndex = atomIdx++
      
      if (isInBranch) { tmpBranch[ptrBranch].atomInBetween++ }
      if (prevIsBond) {
        edges.atomPairs[ptrAtomStack][1] = typeIndex
        ptrAtomStack++
        prevIsBond = false
      }
    }

    if (PATTERNS.Branch.test(token)) {
      tokenType = 'branch'
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

    if (PATTERNS.Bond.test(token)) {
      tokenType = 'bond'
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

    const type: TokenType = tokenType
      ?? (PATTERNS.Ring.test(token) ? 'ring' : 'disconnection')
    tokens.push({ token, type, typeIndex })

    tokenIdx++
    lastToken = token
  }
  return { tokens, edges }
}