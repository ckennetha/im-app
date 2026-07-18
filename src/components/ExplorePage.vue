<script setup lang="ts">
import { ExploreConcept, ExploreMolecule, ExploreMoleculeSample } from "./explore"
import MainSidebar from "./MainSidebar.vue"
import useExplorePath from "@/composables/useExplorePath"

const { model, feature, conceptJSON } = useExplorePath()
</script>

<template>
  <MainSidebar>
    <ExploreConcept v-if="conceptJSON"
      :model="model"
      :feature="feature"
      :concepts="conceptJSON.concepts"
      :position-info="conceptJSON.extras?.positionInfo"
    />
    <div v-else class="flex flex-col items-center justify-center py-3 h-36">
      <img src="/im-spinner.svg" class="animate-spin h-full"/>
    </div>

    <ExploreMolecule :model="model" :feature="feature" />
    
    <ExploreMoleculeSample v-if="conceptJSON" :samples="conceptJSON.samples" />
    <div v-else class="flex flex-col items-center justify-center py-3 h-36">
      <img src="/im-spinner.svg" class="animate-spin h-full"/>
    </div>
  </MainSidebar>
</template>