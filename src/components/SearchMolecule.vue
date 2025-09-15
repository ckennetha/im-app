<script setup lang="ts">
import ActsTable from './exp/activation/ActsTable.vue'
import { createActColumns, toFlatFeatureActivations } from "./exp/activation/columns"
import type { FlatFeatureActivations } from './exp/activation/columns'

import type { TokenActivations } from '@/utils/inference'
import type { Token } from '@/utils/tokenize'
import type { ColumnDef } from '@tanstack/vue-table'
import { shallowRef, onMounted } from 'vue'

const props = defineProps<{
  id: string;
  tokens: Token[];
  activations: Record<string, TokenActivations>;
  isInSearch?: boolean;
}>()

// state
const columns = shallowRef<ColumnDef<FlatFeatureActivations>[]>([])
const actedFeatures = shallowRef<FlatFeatureActivations[]>([])

onMounted(() => {
  columns.value = createActColumns(props.tokens, true)
  actedFeatures.value = toFlatFeatureActivations(props.activations)
})
</script>

<template>
  <ActsTable :columns :data="actedFeatures" :isInSearch/>
</template>

<style scoped>
:deep(button) {
  padding: 0;
  width: 100%;
  height: 100%;
  border: none;

  svg {
    justify-self: center;
    width: 100%;
    height: 100%;
  }
}
</style>