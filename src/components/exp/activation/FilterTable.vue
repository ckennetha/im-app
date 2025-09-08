<script setup lang="ts">
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

import type { CoreTokenType } from "@/utils/tokenize"
import type { FlatFeatureActivations, Range } from "./columns"

import type { Table } from "@tanstack/vue-table"
import { Funnel } from "lucide-vue-next"
import { ref } from "vue"

const { table } = defineProps<{ table: Table<FlatFeatureActivations> }>()

// options
const tokenTypes: CoreTokenType[] = [
  "atom", "bond", "branch", "ring", "disconnection"
]

// state
const rangeCoverage = ref<Range>([0, 100])
const seleTokenTypes = ref<CoreTokenType[]>([...tokenTypes])

// utils
function applyCoverage() {
  table.getColumn("dataCoverage")?.setFilterValue(rangeCoverage)
}

function applyTokenTypes() {
  table.getColumn("dataTokenTypes")?.setFilterValue(seleTokenTypes.value)
}
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button size="icon"
        class="!size-6 !ps-1 !pe-0 !border-0 !shadow-none !bg-transparent
          hover:!bg-transparent group"
      >
        <Funnel class="!size-4 text-ring group-hover:text-foreground" />
      </Button>
    </PopoverTrigger>
    <PopoverContent side="right" class="space-y-5 max-w-56">
      <h2 class="mb-3 text-sm leading-none font-medium">
        Filter by:
      </h2>
      <div class="space-y-2">
        <Label for="rangeCvg">% SMILES coverage</Label>
        <div class="pt-2">
          <Slider
            id="rangeCvg"
            v-model="rangeCoverage"
            @update:model-value="applyCoverage"
            :min="0" :max="100" :step="1"
            :min-steps-between-thumbs="1"
            class="slider-cvg"
          >
          </Slider>
          <div class="flex flex-1 justify-between pt-2 text-xs text-ring">
            <span>Min: {{ rangeCoverage[0] }}%</span>
            <span>Max: {{ rangeCoverage[1] }}%</span>
          </div>
        </div>
      </div>
      <div class="space-y-2">
        <Label for="tkType">
          Token types
        </Label>
        <Select
          id="tkType" multiple
          :model-value="seleTokenTypes"
          @update:model-value="(v: unknown) => {
            const arr = Array.isArray(v) ? (v as CoreTokenType[]) : []
            if (arr.length === 0) return
            seleTokenTypes = arr
            applyTokenTypes()
          }"
        >
          <SelectTrigger class="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="tokenType in tokenTypes"
              :key="tokenType"
              :value="tokenType"
            >
              {{ tokenType }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </PopoverContent>
  </Popover>
</template>

<style scoped>
.slider-cvg :deep(span) {
  border-color: var(--foreground);
  [data-slot="slider-range"] {
    background-color: var(--foreground);
  }
}
</style>