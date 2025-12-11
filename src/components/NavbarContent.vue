<script setup lang="ts">
import type { Component } from "vue"
import type { LucideProps } from "lucide-vue-next"
import { NavigationMenuLink } from "./ui/navigation-menu"

// types
interface NavItem {
  name: string | Component<LucideProps>;
  path: string;
}

const { navItems } = defineProps<{ navItems: NavItem[] }>()

const isIcon = (name: string | Component<LucideProps>):
  name is Component<LucideProps> => typeof name !== 'string'
</script>

<template>
  <NavigationMenuLink v-for="(navItem, idx) in navItems" :key="idx" as-child>
    <RouterLink v-if="navItem.path.startsWith('/')" :to="navItem.path">
      {{ navItem.name }}
    </RouterLink>
    <a v-else :href="navItem.path">
      <component
        v-if="isIcon(navItem.name)"
        :is="navItem.name"
        class="text-foreground size-5 md:size-6"
      />
      <span v-else>{{ navItem.name }}</span>
    </a>
  </NavigationMenuLink>
</template>

<style scoped>
.nav [data-slot="navigation-menu-link"] {
  padding: 7px 29px 7px 11px;
  font-size: var(--text-base);
  text-align: left;

  @media (min-width: 768px) {
    padding: 5px 8px;
    font-size: var(--text-base);
  }
}

a {
  color: inherit;
  text-decoration: none;
  
  &:hover {
    opacity: 1.0;
  }
}
</style>