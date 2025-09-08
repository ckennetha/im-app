<script setup lang="ts">
import Navbar from "./Navbar.vue"

import { marked } from "marked"
import { computed } from "vue"

import mdAbout from "@/assets/about.md?raw"

const aboutString = computed(() => marked.parse(mdAbout))
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <header>
      <Navbar />
    </header>
    <div class="flex-grow space-y-8 mx-auto mt-29 max-w-[768px] text-left">
      <h1>About InterMol</h1>
      <div v-html="aboutString" class="space-y-3 text-lg"></div>
    </div>
  </div>
</template>

<style scoped>
h1 {
  font-size: var(--text-5xl);
  font-weight: 500;
  line-height: var(--text-5xl--line-height);
}
</style>