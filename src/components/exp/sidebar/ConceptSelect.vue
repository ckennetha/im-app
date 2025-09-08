<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { ConceptKey } from "@/config"

const { concepts } = defineProps<{ concepts: ConceptKey[] }>()
</script>

<template>
	<Select>
    <Label for="concept">Or select a concept:</Label>
    <SelectTrigger id="concept" class="w-full !bg-background">
      <SelectValue class="text-sm"/>
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectItem
					v-for="concept in concepts"
					:key="concept"
					:value="concept"
				>
					{{ concept }}
				</SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>