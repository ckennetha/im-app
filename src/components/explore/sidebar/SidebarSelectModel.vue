<script setup lang="ts">
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ModelKey } from "@/config"

const { models } = defineProps<{ models: ModelKey[] }>()
</script>

<template>
	<Select>
    <Label>Select SAE model:</Label>
    <SelectTrigger id="model" class="w-full !bg-background">
      <SelectValue class="text-sm"/>
    </SelectTrigger>
    <SelectContent class="max-h-[var(--dynamic-h)] w-[var(--reka-select-trigger-width)] focus-visible:!ring-0"
      style="--dynamic-h: clamp(112px, calc(112px + (100dvh - 670px)), 156px)"
    >
      <SelectItem v-for="model in models" :key="model" :value="model">
        {{ model }}
      </SelectItem>
    </SelectContent>
  </Select>
</template>