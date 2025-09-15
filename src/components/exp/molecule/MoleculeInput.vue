<script setup lang="ts">
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { computed, watch } from "vue"

const model = defineModel<string>({ required: true })
const props = defineProps({
  useMoleculeDrawer: {
    type: Boolean,
    required: true,
  },
  count: {
    type: Number,
    default: 0,
  },
  maxMolecules: {
    type: Number,
    default: 1,
  },
})
const emit = defineEmits<{ (e: "update:limitReached", value: boolean): void }>()

// state
const isMoleculeLimit = computed<boolean>(() => props.count >= props.maxMolecules)

// utils
const preventEvent = (e: Event) => { isMoleculeLimit.value && e.preventDefault() }

function removeOverflow(): void {
  const lines = (model.value).split(/\r?\n/)
  if (lines.length > props.maxMolecules) {
    model.value = lines.slice(0, props.maxMolecules).join("\n")
  }
}

watch(isMoleculeLimit, (newValue) => {
  if (newValue) {
    emit("update:limitReached", true)
  } else {
    emit("update:limitReached", false)
  }
}, { immediate: true })
</script>

<template>
  <div>
    <Label v-if="maxMolecules > 1" for="input-molecule" class="pb-1 text-sm">
      Enter one or more SMILES strings (newline separated, with optional names separated by a space):
    </Label>
    <div class="flex flex-row w-full justify-between pb-1">
      <div v-if="!useMoleculeDrawer" class="flex flex-col flex-2 max-w-full">
        <Textarea
          id="input-molecule"
          v-model="model"
          :class="cn('textarea text-sm focus-visible:ring-0', 
            maxMolecules > 1 && 'h-55'
          )"
          :placeholder="maxMolecules == 1 ? 'Enter a SMILES string...': ''"
          @keydown.enter="preventEvent"
          @paste="preventEvent"
          @drop="preventEvent"
          @input="removeOverflow"
        ></Textarea>
      </div>
      <div v-else class='flex flex-3'>
        <iframe
          id="ketcher"
          src="/ketcher/index.html"
          class="w-full h-100 border rounded-md shadow-xs"
        />
      </div>
    </div>
    <p v-if="maxMolecules > 1" class="text-sm text-muted-foreground">
      <i>Molecules: {{ count }}/10</i>
    </p>
  </div>
</template>