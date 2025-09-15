<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"

import { DEFAULT_CATEGORICAL_COLORS } from "@/cfg"
import { coreTokenTypes, type CoreTokenType } from "@/utils/tokenize"

const { concepts } = defineProps<{
  concepts: Record<CoreTokenType, Record<string, number[]>>
}>()

const groupColors = Object.fromEntries(
  coreTokenTypes.map((cTT, idx) => [cTT, DEFAULT_CATEGORICAL_COLORS[idx]])
)
</script>

<template>
	<Select>
    <Label for="concept">Or select a concept:</Label>
    <SelectTrigger id="concept" class="w-full !bg-background">
      <SelectValue class="text-sm"/>
    </SelectTrigger>
    <SelectContent side="bottom"
      class="max-h-[var(--dynamic-h)] focus-visible:!ring-0"
      style="--dynamic-h: clamp(112px, calc(112px + (100dvh - 670px)), 304px)"
    >
      <SelectGroup
        v-for="(conceptPtrs, tokenType) in concepts"
        :key="tokenType"
        class="my-1 first:mt-0 last:mb-0 border rounded-md"
      >
        <Badge class="ms-1 my-1 text-xs text-muted"
          :style="{ backgroundColor: groupColors[tokenType] }"
        >
          {{ tokenType.charAt(0).toUpperCase() + tokenType.slice(1) }}
        </Badge>
        <SelectItem
					v-for="(featureIdxs, concept) in conceptPtrs"
					:key="concept"
					:value="{ tokenType, concept }"
				>
					"{{ concept }}" ({{ featureIdxs.length }})
				</SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>