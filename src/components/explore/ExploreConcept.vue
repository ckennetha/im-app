<script setup lang="ts">
import { ref } from "vue"
import { CircleQuestionMark } from "lucide-vue-next"

import { Button } from "@/components/ui/button"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

import ConceptsTable from "./concept/ConceptTable.vue"
import type { ConceptData } from "./concept/columns"

const { descriptions } = defineProps<{ feature: number; descriptions?: ConceptData[] }>()

// state
const open = ref<boolean>(false)
</script>

<template>
  <div class="space-y-3 w-full text-left">
    <div class="flex flex-1 flex-nowrap items-center gap-x-2">
      <h1 class="text-3xl font-medium">{{ `f/${feature}` }}</h1>
      <TooltipProvider disableClosingTrigger>
        <Tooltip v-model:open="open">
          <TooltipTrigger as-child>
            <Button size="icon" class="size-5 !px-0 !pt-1 !pb-0 !border-none !shadow-none hover:!bg-background"
              @click="open = !open"
            >
              <CircleQuestionMark class="size-5 text-muted-foreground"/>
            </Button>
          </TooltipTrigger>
          <TooltipContent :collisionPadding="{ left: 20 }" class="bg-foreground text-background max-w-66.5">
            We evaluated the concepts on a separate test set of 250,000 randomly sampled
            SMILES and kept those with a minimum F1 score of 0.50.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
    <ConceptsTable :data="descriptions" />
  </div>
</template>