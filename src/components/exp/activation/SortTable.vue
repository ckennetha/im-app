<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

import type { FlatFeatureActivations, Sorter } from "./columns"
import type { Table } from "@tanstack/vue-table"

import { ArrowDown10 } from "lucide-vue-next"
import { ref, watch } from "vue"

const { table } = defineProps<{ table: Table<FlatFeatureActivations> }>()

// options
const sortModes: Sorter[] = ["max activation", "mean non-zero activation", "mean all"]

// state
const sortMode = ref<Sorter>("max activation")

watch(() => sortMode.value, () => {
  table.setSorting([
    { id: sortMode.value === "max activation"
        ? "dataMax" : sortMode.value === "mean all"
        ? "dataMeanAll" : "dataMeanNonzero",
      desc: true
    }
  ])
}, { immediate: true })
</script>

<template>
  <Select id="sortAct" v-model="sortMode">
    <SelectTrigger as-child withoutIcon>
      <Button size="icon"
        class="!justify-center !size-6 !p-0 !border-0 !shadow-none !bg-transparent
        hover:!bg-transparent group"
      >
        <ArrowDown10 class="!size-4.5 text-ring group-hover:text-foreground" />
      </Button>
    </SelectTrigger>
    <SelectContent>
      <SelectItem
        v-for="sorter in sortModes"
        :key="sorter"
        :value="sorter"
      >
        {{ sorter }}
      </SelectItem>
    </SelectContent>
  </Select>
</template>