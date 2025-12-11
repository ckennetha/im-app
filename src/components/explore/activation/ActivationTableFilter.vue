<script setup lang="ts">
import { ref } from "vue"
import type { Table } from "@tanstack/vue-table"
import { Funnel, LucideX } from "lucide-vue-next"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

import type { FlatTokenActivation, ActivationRange } from "./columns"
import { type CoreTokenType, coreTokenTypes } from "@/utils/tokenize"

const { table } = defineProps<{ table: Table<FlatTokenActivation> }>()

// states
const open = ref<boolean>(false)
const rangeCoverage = ref<ActivationRange>([0, 100])
const seleTokenTypes = ref<CoreTokenType[]>([])

// utils
function applyCoverage() { table.getColumn("coverage")?.setFilterValue(rangeCoverage) }

function onUpdateTokenTypes(v: unknown) {
  const arr = Array.isArray(v) ? (v as CoreTokenType[]) : []
  seleTokenTypes.value = arr
  table.getColumn("tokenTypes")?.setFilterValue(seleTokenTypes.value)
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button size="icon"
        class="!size-6 !ps-1 !pe-0 !border-0 !shadow-none !bg-transparent hover:!bg-transparent group"
      >
        <Funnel class="!size-4 text-muted-foreground group-hover:text-foreground" />
      </Button>
    </PopoverTrigger>
    <PopoverContent side="right" class="space-y-5 max-w-56">
      <div class="flex flex-1 items-center justify-between mb-5">
        <h2 class="text-base leading-none font-medium">Filter by:</h2>
        <Button size="icon"
          class="!size-4 !p-0 !border-0 !shadow-none !bg-transparent hover:!bg-transparent group"
          @click="open = false"
        >
          <LucideX class="text-muted-foreground group-hover:text-foreground"/>
        </Button>
      </div>
      <div class="space-y-2">
        <Label for="cover">% SMILES coverage</Label>
        <div class="pt-2">
          <Slider
            id="cover"
            v-model="rangeCoverage"
            @update:model-value="applyCoverage"
            :min="0" :max="100" :step="1"
            :min-steps-between-thumbs="1"
            class="cover"
          >
          </Slider>
          <div class="flex flex-1 justify-between pt-2 text-xs text-ring">
            <span>Min: {{ rangeCoverage[0] }}%</span>
            <span>Max: {{ rangeCoverage[1] }}%</span>
          </div>
        </div>
      </div>
      <div class="space-y-2">
        <Label for="tkType">Token types</Label>
        <Select id="tkType" multiple :model-value="seleTokenTypes"
          @update:model-value="onUpdateTokenTypes"
        >
          <SelectTrigger class="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="tokenType in coreTokenTypes" :key="tokenType" :value="tokenType">
              {{ tokenType }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </PopoverContent>
  </Popover>
</template>

<style scoped>
.cover :deep(span) {
  border-color: var(--foreground);
  [data-slot="slider-range"] {
    background-color: var(--foreground);
  }
}
</style>