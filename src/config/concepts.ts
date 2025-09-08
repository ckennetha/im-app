import type { ModelKey } from "./models"

// types
export interface Concept {
  ptrModel: ModelKey;
  ptrFeature: number;
  group: string;
  description: string;
}

// config
export const Concepts: Record<string, Concept> = {
  "Token '('": {
    ptrModel: "MOL-1-3072-128",
    ptrFeature: 12,
    group: "Ring",
    description: "Activates on token denoting the branch opening."
  }
}

// types
export type ConceptKey = keyof typeof Concepts

// config
export const ConceptsMap: Record<string, ConceptKey[]> = {
  "MOL-1-3072-128/12": [
    "Token '('",
  ],
}