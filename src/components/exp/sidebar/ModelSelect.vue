<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { ModelKey } from "@/config"

const { models } = defineProps<{ models: ModelKey[] }>()
</script>

<template>
	<Select>
    <Label for="model">Select SAE model:</Label>
    <SelectTrigger id="model" class="w-full !bg-background">
      <SelectValue class="text-sm"/>
    </SelectTrigger>
    <SelectContent>
      <SelectItem
        v-for="model in models"
        :key="model"
        :value="model"
      >
        {{ model }}
      </SelectItem>
    </SelectContent>
  </Select>
</template>