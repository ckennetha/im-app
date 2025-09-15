import { defineStore } from "pinia"
import { ref, computed } from "vue"

// types
export type MoleculeSmiles = string
export interface Molecule {
  id: string;
  smiles: string;
}

// store
export const useMoleculeStore = defineStore('mol', () => {
  // state
  const rawMolecule = ref<string>('')
  const mols = computed<string[]>(() => {
    return rawMolecule.value
    .split(/\r?\n/)
    .filter(el => el.trim() !== '')
  })

  // getter
  const smiMolecule = computed<MoleculeSmiles[]>(() => {
    return mols.value.map(mol => mol.split(/\s+/)[0])
  })

  const countMolecule = computed<number>(() => {
    return mols.value.length
  })

  // action
  const addMolecule = (newRawMolecule: string): void => {
    rawMolecule.value = rawMolecule.value === ''
      ? newRawMolecule : `${rawMolecule.value}\n${newRawMolecule}`
  }

  const setMolecule = (newRawMolecule: string): void => {
    rawMolecule.value = newRawMolecule
  }

  const parseMolecule = (): Molecule[] => {
    const molecules: Molecule[] = []
    for (let i = 0; i < mols.value.length; i++) {
      const mol = mols.value[i]
      let [smiles, id] = mol.split(/\s+/)
      if (!id) {
        id = `Molecule ${i}`
      }
      molecules.push({ id, smiles })
    }
    return molecules
  }

  return {
    rawMolecule,
    smiMolecule,
    countMolecule,
    addMolecule,
    setMolecule,
    parseMolecule
  }
}, { persist: true })

// types
export type MoleculeStore = ReturnType<typeof useMoleculeStore>