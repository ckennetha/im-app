<script setup lang="ts">
import { Card, CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

const { id, svgString } = defineProps<{ id: number | string; svgString: string }>()

// util
const handleIdLabel = (): string => { return typeof id === "number" ? `#${id}` : id }
</script>

<template>
  <Card class="relative p-0 rounded-md shadow-xs">
    <Label class="absolute inline-block top-0 left-0 z-0 max-w-3/4 px-3 py-2 bg-foreground/5 rounded-tl-sm truncate cursor-pointer pointer-events-none">
      {{ handleIdLabel() }}
    </Label>
    <CardHeader class="p-0 gap-0">
      <div class="w-full aspect-square">
        <img :src="`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`"
          :alt="`${id}`" class="py-auto w-full h-full object-contain"
        >
      </div>
    </CardHeader>
  </Card>
</template>