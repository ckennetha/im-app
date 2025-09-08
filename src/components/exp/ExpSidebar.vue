<script setup lang="ts">
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ModelSelect, ConceptSelect, FeatureInput } from "./sidebar"

import useExplorePath from "@/composables/useExplorePath"
import { DEFAULT_FEATURE_MAX } from "@/cfg"
import { Models, Concepts, type Model, type ModelKey } from "@/config"

import { useDebounceFn } from "@vueuse/core"
import { ref, computed } from "vue"

// state
const { model, feature, isInExplore, setBoth } = useExplorePath()

const models: ModelKey[] = Object.keys(Models)
const seleModelObject = computed<Model>(() => Models[model.value])

const concepts: string[] = Object.keys(Concepts)
const seleConcept = ref<string | null>(null)

// utils
function handleRandomFeature(min: number, max: number) {
  feature.value = min + Math.floor(Math.random() * (max - min + 1))
}
const debouncedHandleRandomFeature = useDebounceFn(handleRandomFeature, 200)

function handleConceptChange(newValue: string) {
  const nC = Concepts[newValue]
  setBoth({ model: nC.ptrModel, feature: nC.ptrFeature })
}
</script>

<template>
  <Sidebar
    id="sidebar"
    variant="inset"
    class="p-0 w-[16rem] border-r border-border"
  >
    <SidebarHeader class="m-1">
      <Label as-child class="justify-center gap-x-3 my-1 text-lg">
        <RouterLink to="/" class="text-xl" style="text-decoration: none;">
          <img src="/intermol.svg" class="size-13"/>
          InterMol
        </RouterLink>
      </Label>
      <ModelSelect :models="models" v-model="model" />
      <div>
        <table>
          <tbody>
            <tr>
              <td>Base:</td>
              <td>
                <a :href="seleModelObject.baseModelLink">
                  {{ seleModelObject.baseModel }}
                </a>
              </td>
            </tr>
            <tr>
              <td>Base layer:</td>
              <td>{{ seleModelObject.baseLayer }}</td>
            </tr>
            <tr>
              <td>SAE dimension:</td>
              <td>{{ seleModelObject.numDims }}</td>
            </tr>
            <tr>
              <td>SAE k:</td>
              <td>{{ seleModelObject.numK }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </SidebarHeader>
    <Separator />
    <SidebarContent class="m-1">
      <SidebarGroup>
        <Button class="w-full border border-border" as-child>
          <RouterLink :to="isInExplore ? '/search' : '/explore'"
            class="hover:!opacity-100 active:bg-primary"
            style="text-decoration: none;"
          >
            {{ isInExplore ? 'Search' : 'Explore' }} SAE Features
          </RouterLink>
        </Button>
      </SidebarGroup>
      <SidebarGroup class="gap-y-2">
        <FeatureInput v-model="feature" disableWheelChange
          :min="0" :max="DEFAULT_FEATURE_MAX"
        />
        <span class="justify-center text-sm leading-none font-medium
          text-center"
        >
          or
        </span>
        <Button @click="debouncedHandleRandomFeature(0, DEFAULT_FEATURE_MAX)"
          class="active:bg-primary"
        >
          Random Feature
        </Button>
      </SidebarGroup>
      <SidebarGroup class="gap-y-2">
        <ConceptSelect
          v-model="seleConcept"
          @update:modelValue="handleConceptChange"
          :concepts="concepts"
        />
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