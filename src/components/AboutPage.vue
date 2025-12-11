<script setup lang="ts">
import { marked } from "marked"
import Navbar from "./Navbar.vue"
import mdAbout from "@/assets/about.md?raw"

const aboutString = marked.parse(mdAbout)
</script>

<template>
  <div>
    <header class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between mx-auto ps-2 pe-3 py-2 max-w-[1280px] bg-background">
      <Navbar />
    </header>
    <main class="flex-grow space-y-8 mx-auto pt-21 sm:pt-0 px-3 max-w-[768px] text-left">
      <h1 class="text-5xl font-medium">About InterMol</h1>
      <div v-html="aboutString" class="space-y-3 text-lg" />
    </main>
  </div>
</template>