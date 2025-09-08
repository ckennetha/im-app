<script setup lang="ts">
import Navbar from "./Navbar.vue"

import { marked } from "marked"
import { computed } from "vue"

import mdAbout from "@/assets/about.md?raw"

const aboutString = computed(() => marked.parse(mdAbout))
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <header class="fixed top-0 left-0 right-0 z-50 flex items-center
      justify-between ps-2 pe-3 py-2 mx-auto max-w-[1280px] bg-background"
    >
      <Navbar />
    </header>
    <main class="flex-grow space-y-8 mx-auto mt-29 max-w-[768px] text-left">
      <h1>About InterMol</h1>
      <div v-html="aboutString" class="space-y-3 text-lg"></div>
    </main>
  </div>
</template>

<style scoped>
h1 {
  font-size: var(--text-5xl);
  font-weight: 500;
  line-height: var(--text-5xl--line-height);
}
</style>