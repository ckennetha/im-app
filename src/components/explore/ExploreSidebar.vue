<script setup lang="ts">
import { shallowRef, computed } from "vue"
import { useDebounceFn } from "@vueuse/core"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Sidebar, SidebarContent, SidebarGroup, SidebarHeader } from "@/components/ui/sidebar"

import { SidebarInputFeature, SidebarSelectConcept, SidebarSelectModel } from "./sidebar"
import useExplorePath from "@/composables/useExplorePath"
import type { CoreTokenType } from "@/utils/tokenize"

import { Concepts, Models, type Model, type ModelKey } from "@/config"
import { DEFAULT_FEATURE_MAX } from "@/defaults"

// type
interface ConceptPtr {
  tokenType: CoreTokenType,
  concept: string,
}

// states
const { model, feature, isInExplore } = useExplorePath()

const models: ModelKey[] = Object.keys(Models)
const seleModels = computed<Model>(() => Models[model.value])

const conceptPtr = shallowRef<ConceptPtr>()
const seleConcepts = computed<Record<CoreTokenType, Record<string, number[]>>>(() => Concepts[model.value])

// utils
function handleRandomFeature(min: number, max: number) {
  feature.value = min + Math.floor(Math.random() * (max - min + 1))
}
const debouncedHandleRandomFeature = useDebounceFn(handleRandomFeature, 200)

function handleConceptChange(newValue: ConceptPtr): void {
  const { tokenType, concept } = newValue
  const featureIdxs = seleConcepts.value[tokenType][concept]
  feature.value = featureIdxs[Math.floor(Math.random() * featureIdxs.length)]
}
</script>

<template>
  <Sidebar id="sidebar" variant="inset" class="p-0 w-[16rem] border-r border-border">
    <SidebarHeader class="m-1">
      <Label as-child class="justify-center gap-x-3 my-1 text-[22px]">
        <RouterLink to="/" class="tracking-tight" style="text-decoration: none;">
          <img src="/intermol.svg" class="size-13"/>
          InterMol
        </RouterLink>
      </Label>
      <SidebarSelectModel :models="models" v-model="model" />
      <div>
        <table>
          <tbody>
            <tr>
              <td>Base:</td>
              <td>
                <a :href="seleModels.baseModelLink" target="_blank" rel="noopener noreferrer">
                  {{ seleModels.baseModel }}
                </a>
              </td>
            </tr>
            <tr>
              <td>Base layer:</td>
              <td>{{ seleModels.baseLayer }}</td>
            </tr>
            <tr>
              <td>SAE dimension:</td>
              <td>{{ seleModels.numDims }}</td>
            </tr>
            <tr>
              <td>SAE k:</td>
              <td>{{ seleModels.numK }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </SidebarHeader>
    <Separator />
    <SidebarContent class="m-1">
      <SidebarGroup>
        <Button class="w-full border border-border" as-child>
          <RouterLink :to="isInExplore ? '/search' : '/explore'" class="hover:!opacity-100 active:bg-primary" style="text-decoration: none;">
            {{ isInExplore ? 'Search' : 'Explore' }} SAE Features
          </RouterLink>
        </Button>
      </SidebarGroup>
      <SidebarGroup class="gap-y-2">
        <SidebarInputFeature v-model="feature" disableWheelChange :min="0" :max="DEFAULT_FEATURE_MAX" />
        <span class="justify-center text-sm leading-none font-medium text-center">or</span>
        <Button @click="debouncedHandleRandomFeature(0, DEFAULT_FEATURE_MAX)" class="active:bg-primary">
          Random Feature
        </Button>
      </SidebarGroup>
      <SidebarGroup class="gap-y-2">
        <SidebarSelectConcept v-model="conceptPtr" @update:modelValue="handleConceptChange" :concepts="seleConcepts" />
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>
</template>

<style scoped>
table {
  font-size: var(--text-sm);
  text-align: left;

  td:first-child {
    width: 128px;
    font-weight: 500;
    vertical-align: top;
  }
}
</style>