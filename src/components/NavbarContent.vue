<script setup lang="ts">
import { NavigationMenuLink } from "./ui/navigation-menu"

import { type LucideProps } from "lucide-vue-next"
import { type Component } from "vue"

// types
interface Nav {
  name: string | Component<LucideProps>;
  path: string;
}

const { navs } = defineProps<{ navs: Nav[] }>()

const isIcon = (nav: string | Component<LucideProps>):
  nav is Component<LucideProps> =>
  typeof nav !== 'string'
</script>

<template>
  <NavigationMenuLink
    v-for="(nav, idx) in navs"
    :key="idx"
    as-child
  >
    <RouterLink
      v-if="nav.path.startsWith('/')"
      :to="nav.path"
    >
      {{ nav.name }}
    </RouterLink>
    <a v-else :href="nav.path">
      <component
        v-if="isIcon(nav.name)" :is="nav.name"
        class="text-foreground size-5 md:size-6"
      />
      <span v-else>
        {{ nav.name }}
      </span>
    </a>
  </NavigationMenuLink>
</template>

<style scoped>
.nav [data-slot="navigation-menu-link"] {
  padding: 6px 18px 6px 10px;
  font-size: var(--text-base);
  text-align: left;
}

.nav-md [data-slot="navigation-menu-link"] {
  padding: 6px 10px;
  font-size: var(--text-base);
}

a {
  font-weight: 500;
  color: inherit;
  text-decoration: none;
}
a:hover {
  opacity: 1.0;
}
</style>