<script setup lang="ts">
import ExploreSidebar from "./ExploreSidebar.vue"
import { ExpActivator, ExpDescription, ExpMolecule } from "./exp"

import useExplorePath from "@/composables/useExplorePath"

const { model, feature } = useExplorePath()
</script>

<template>
  <ExploreSidebar>
    <ExpDescription :model="model" :feature="feature" />
    <ExpMolecule :model="model" :feature="feature" />
    <ExpActivator :model="model" :feature="feature" />
  </ExploreSidebar>
</template>