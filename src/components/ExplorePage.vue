<script setup lang="ts">
import { ExploreConcept, ExploreMolecule, ExploreMoleculeSample } from "./explore"
import MainSidebar from "./MainSidebar.vue"
import useExplorePath from "@/composables/useExplorePath"

const { model, feature, conceptJSON } = useExplorePath()
</script>

<template>
  <MainSidebar>
    <template v-if="conceptJSON">
      <ExploreConcept :feature="feature" :descriptions="conceptJSON.description" />
      <ExploreMolecule :model="model" :feature="feature" />
      <ExploreMoleculeSample :samples="conceptJSON.samples" />
    </template>
    <div v-else class="flex flex-col items-center justify-center my-auto h-36">
      <img src="/im-spinner.svg" class="animate-spin h-full"/>
    </div>
  </MainSidebar>
</template>