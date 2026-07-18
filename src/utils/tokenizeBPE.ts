import type { Token } from "./tokenize"

// util
const loadMergeRanks = (() => {
  let ranksLoadingPromise: Promise<Map<string, number>>

  return (basePath: string) => {
    if (!ranksLoadingPromise) {
      ranksLoadingPromise = fetch(`${basePath}/merges.txt`)
        .then(res => res.text())
        .then(text => {
          const lines = text.split("\n")
            .map(line => line.trim())
            .filter(line => line && !line.startsWith("#"))
          return new Map(lines.map((pair, rank) => [pair, rank]))
        })
    }
    return ranksLoadingPromise
  }
})()

function mergePieces(pieces: string[], ranks: Map<string, number>): string[] {
  const seq = [...pieces]
  while (seq.length > 1) {
    let bestRank = Infinity
    let bestIdx = -1
    for (let i = 0; i < seq.length - 1; i++) {
      const rank = ranks.get(`${seq[i]} ${seq[i + 1]}`)
      if (rank !== undefined && rank < bestRank) {
        bestRank = rank
        bestIdx = i
      }
    }
    if (bestIdx === -1) break
    seq.splice(bestIdx, 2, seq[bestIdx] + seq[bestIdx + 1])
  }
  return seq
}

export async function tokenizeBPE(smi: string, basePath = "/tokenizer/ChemBERTa"): Promise<Token[]> {
  const ranks = await loadMergeRanks(basePath)
  const pieces = mergePieces([...smi], ranks)

  // BPE pieces don't map 1:1 to RDKit atom indices, so no 2D
  // highlight support here (only 1D activation coloring).
  return pieces.map(token => ({ token, type: "Disconnection", typeIndex: null }))
}