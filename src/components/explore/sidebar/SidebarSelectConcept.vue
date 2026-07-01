<script setup lang="ts">
import { ref } from "vue"
import { Info } from "lucide-vue-next"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

import { coreTokenTypes, type CoreTokenType } from "@/utils/tokenize"
import { DEFAULT_CATEGORICAL_COLORS } from "@/defaults"

const { concepts } = defineProps<{ concepts: Record<CoreTokenType, Record<string, number[]>> }>()

const groupColors = Object.fromEntries(
  coreTokenTypes.map((cTT, idx) => [cTT, DEFAULT_CATEGORICAL_COLORS[idx]])
)

// state
const open = ref<boolean>(false)
</script>

<template>
	<Select>
    <div class="flex flex-row gap-x-1">
      <Label>Or select a concept:</Label>
      <TooltipProvider>
        <Tooltip v-model:open="open">
          <TooltipTrigger as-child>
            <Button size="icon" class="size-3 !px-0 !pt-1 !pb-0 !border-none !shadow-none hover:!bg-background"
              @click="open = !open"
            >
              <Info class="size-3 text-muted-foreground"/>
            </Button>
          </TooltipTrigger>
          <TooltipContent :collisionPadding="{ left: 20 }" class="bg-foreground text-background max-w-[172px]">
            Concepts evaluated on 250k SMILES with F1 ≥ 0.50.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
    <SelectTrigger id="concept" class="w-full !bg-background">
      <SelectValue class="text-sm"/>
    </SelectTrigger>
    <SelectContent side="bottom" class="max-h-[var(--dynamic-h)] focus-visible:!ring-0"
      style="--dynamic-h: clamp(112px, calc(112px + (100dvh - 670px)), 304px)"
    >
      <SelectGroup v-for="(conceptPtrs, tokenType) in concepts" :key="tokenType"
        class="my-1 first:mt-0 last:mb-0 border rounded-md"
      >
        <Badge class="ms-1 my-1 text-xs text-muted" :style="{ backgroundColor: groupColors[tokenType] }">
          {{ tokenType }}
        </Badge>
        <SelectItem v-for="(featureIdxs, concept) in conceptPtrs" :key="concept" :value="{ tokenType, concept }">
					"{{ concept }}" ({{ featureIdxs.length }})
				</SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>