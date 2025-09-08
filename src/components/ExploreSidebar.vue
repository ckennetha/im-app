<script setup lang="ts">
import { SidebarInset, SidebarProvider, SidebarTrigger } from "./ui/sidebar"
import { ExpSidebar } from "./exp"
</script>

<template>
  <SidebarProvider>
    <ExpSidebar/>
    <div class="fixed top-0 left-0 right-0 z-50 flex items-center px-5 py-3
      w-full bg-background border-b border-border md:hidden"
    >
      <SidebarTrigger class="!px-0 !border-0" />
    </div>
    <SidebarInset class="space-y-5 mt-11 p-[1rem] min-w-0
      md:peer-data-[variant=inset]:!m-0 !rounded-none !shadow-none"
    >
      <slot />
    </SidebarInset>
  </SidebarProvider>
</template>