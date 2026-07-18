// type
export interface Model {
  baseModel: string;
  baseModelLink: string;
  baseLayer: number;
  numDims: number;
  numK: number;
  doInference: boolean;
}

// config
export const Models: Record<string, Model> = {
  // MoLFormer-XL
  "MOL-1-3072-128": {
    baseModel: "MoLFormer-XL-both-10%",
    baseModelLink: "https://huggingface.co/ibm-research/MoLFormer-XL-both-10pct",
    baseLayer: 1,
    numDims: 3072,
    numK: 128,
    doInference: true,
  },
  "MOL-3-3072-128": {
    baseModel: "MoLFormer-XL-both-10%",
    baseModelLink: "https://huggingface.co/ibm-research/MoLFormer-XL-both-10pct",
    baseLayer: 3,
    numDims: 3072,
    numK: 128,
    doInference: false,
  },
  "MOL-6-3072-128": {
    baseModel: "MoLFormer-XL-both-10%",
    baseModelLink: "https://huggingface.co/ibm-research/MoLFormer-XL-both-10pct",
    baseLayer: 6,
    numDims: 3072,
    numK: 128,
    doInference: false,
  },
  "MOL-9-3072-128": {
    baseModel: "MoLFormer-XL-both-10%",
    baseModelLink: "https://huggingface.co/ibm-research/MoLFormer-XL-both-10pct",
    baseLayer: 9,
    numDims: 3072,
    numK: 128,
    doInference: true,
  },
  "MOL-12-3072-128": {
    baseModel: "MoLFormer-XL-both-10%",
    baseModelLink: "https://huggingface.co/ibm-research/MoLFormer-XL-both-10pct",
    baseLayer: 12,
    numDims: 3072,
    numK: 128,
    doInference: false,
  },

  // ChemBERTa
  "CHE-1-3072-128": {
    baseModel: "ChemBERTa",
    baseModelLink: "https://huggingface.co/seyonec/ChemBERTa-zinc-base-v1",
    baseLayer: 1,
    numDims: 3072,
    numK: 128,
    doInference: false,
  },
  "CHE-2-3072-128": {
    baseModel: "ChemBERTa",
    baseModelLink: "https://huggingface.co/seyonec/ChemBERTa-zinc-base-v1",
    baseLayer: 2,
    numDims: 3072,
    numK: 128,
    doInference: false,
  },
  "CHE-3-3072-128": {
    baseModel: "ChemBERTa",
    baseModelLink: "https://huggingface.co/seyonec/ChemBERTa-zinc-base-v1",
    baseLayer: 3,
    numDims: 3072,
    numK: 128,
    doInference: false,
  },
  "CHE-4-3072-128": {
    baseModel: "ChemBERTa",
    baseModelLink: "https://huggingface.co/seyonec/ChemBERTa-zinc-base-v1",
    baseLayer: 4,
    numDims: 3072,
    numK: 128,
    doInference: false,
  },
  "CHE-5-3072-128": {
    baseModel: "ChemBERTa",
    baseModelLink: "https://huggingface.co/seyonec/ChemBERTa-zinc-base-v1",
    baseLayer: 5,
    numDims: 3072,
    numK: 128,
    doInference: false,
  },
  "CHE-6-3072-128": {
    baseModel: "ChemBERTa",
    baseModelLink: "https://huggingface.co/seyonec/ChemBERTa-zinc-base-v1",
    baseLayer: 6,
    numDims: 3072,
    numK: 128,
    doInference: false,
  },
}

// type
export type ModelKey = keyof typeof Models