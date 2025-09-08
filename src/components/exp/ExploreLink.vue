<script setup lang="ts">
import useModelParam from '@/composables/useModelParam'
import { useMoleculeStore, type MoleculeSmiles } from '@/store'

import { useRoute, RouterLink } from 'vue-router'

const props = defineProps<{ smi: MoleculeSmiles; feature: number }>()

const route = useRoute()
const moleculeStore = useMoleculeStore()

// composable
const model = useModelParam()

function goTo() {
  if (route.name === "Search") {
    moleculeStore.setMolecule(props.smi)
  }

  return {
    name: 'Explore',
    params: { model: model.value, feature: props.feature },
  }
}
</script>

<template>
  <RouterLink :to="goTo()">
    f/{{ props.feature }}
  </RouterLink>
</template>