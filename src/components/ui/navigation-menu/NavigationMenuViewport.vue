<script setup lang="ts">
import type { NavigationMenuViewportProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import {
  NavigationMenuViewport,

  useForwardProps,
} from "reka-ui"
import { cn } from "@/lib/utils"

const props = defineProps<NavigationMenuViewportProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <div class="absolute top-full right-0 isolate z-50 flex justify-center">
    <NavigationMenuViewport
      data-slot="navigation-menu-viewport"
      v-bind="forwardedProps"
      :class="
        cn(
          'origin-top-center bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-top-3 data-[state=closed]:fade-out-0 data-[state=closed]:ease-in data-[state=open]:slide-in-from-top-3 data-[state=open]:fade-in-0 data-[state=open]:ease-out duration-150 relative mt-1.5 h-[var(--reka-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border shadow md:w-[var(--reka-navigation-menu-viewport-width)]',
          props.class,
        )
      "
    />
  </div>
</template>
