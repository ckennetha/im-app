<script setup lang="ts">
import { ref, watch } from "vue"
import { ArrowDown10 } from "lucide-vue-next"
import type { Table } from "@tanstack/vue-table"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger } from "@/components/ui/select"

import { type FlatTokenActivation, type ActivationSorter, sortModes } from "./columns"

const { table } = defineProps<{ table: Table<FlatTokenActivation> }>()

// state
const sortMode = ref<ActivationSorter>("max activation")

watch(() => sortMode.value, () => {
  table.setSorting([
    { id: sortMode.value === "max activation"
        ? "max" : sortMode.value === "mean all activation"
        ? "meanAll" : "meanNonzero",
      desc: true
    }
  ])
}, { immediate: true })
</script>

<template>
  <Select id="sortAct" v-model="sortMode">
    <SelectTrigger as-child withoutIcon class="[&[data-state=open]>svg]:!rotate-0">
      <Button size="icon"
        class="!justify-center !size-6 !p-0 !border-0 !shadow-none !bg-transparent hover:!bg-transparent group"
      >
        <ArrowDown10 class="!size-4.5 text-muted-foreground group-hover:text-foreground" />
      </Button>
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <h2 class="ps-2 pt-2 pb-3 text-base leading-none font-medium">Sort by:</h2>
        <SelectItem v-for="sorter in sortModes" :key="sorter" :value="sorter">
          {{ sorter }}
        </SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>