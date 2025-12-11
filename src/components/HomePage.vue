<script setup lang="ts">
import { Button } from "./ui/button"
import Navbar from "./Navbar.vue"
</script>

<template>
  <div>
    <header class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between mx-auto ps-2 pe-3 py-2 max-w-[1280px] bg-background">
      <Navbar />
    </header>
    <main class="space-y-5 mx-auto mt-0 px-3 max-w-[768px] h-full">
      <h1 class="text-5xl font-bold">InterMol Feature Explorer</h1>
      <p class="px-2 text-xl">
        A map of molecular features discovered in a chemical
        language model via mechanistic interpretability
      </p>
      <Button variant="secondary" as-child
        class="mt-3 px-8 py-5 text-xl !text-background !no-underline"
      >
        <RouterLink to="/explore">Explore</RouterLink>
      </Button>
    </main>
  </div>
</template>