<script setup lang="ts">
import { useRoute, RouterLink } from "vue-router"
import useModelParam from '@/composables/useModelParam'
import { useMoleculeStore, type MoleculeSmiles } from '@/store'

const props = defineProps<{ smi: MoleculeSmiles; feature: number }>()

const route = useRoute()
const model = useModelParam()
const moleculeStore = useMoleculeStore()

function goTo() {
  if (route.name === "Search") {
    moleculeStore.setMolecule(props.smi)
  }
  return { name: 'Explore', params: { model: model.value, feature: props.feature } }
}
</script>

<template>
  <RouterLink :to="goTo()" :target="route.name === 'Explore' ? '_self' : '_blank'">
    f/{{ props.feature }}
  </RouterLink>
</template>