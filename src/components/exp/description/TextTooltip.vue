<script setup lang="ts">
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import { ref } from "vue"

const { text } = defineProps<{ text: string }>()

// state
const open = ref<boolean>(false)
</script>

<template>
  <TooltipProvider>
    <Tooltip v-model:open="open" disableClosingTrigger>
      <TooltipTrigger asChild>
        <span class="underline decoration-dotted cursor-help"
          @click="open = !open"
        >
          <slot />
        </span>
      </TooltipTrigger>
      <TooltipContent
        v-html="text"
        class="bg-foreground text-background text-center pb-2"
      />
    </Tooltip>
  </TooltipProvider>
</template>