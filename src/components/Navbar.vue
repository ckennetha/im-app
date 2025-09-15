<script setup lang="ts">
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "./ui/navigation-menu"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import NavbarContent from "./NavbarContent.vue"

import { Menu, Github, Mail } from "lucide-vue-next"

const Navs = [
  { name: "Explore", path: "/explore" },
  { name: "Search", path: "/search" },
  { name: "About", path: "/about" },
  { name: "Preprint", path: "javascript:;" },
  { name: Github, path: "https://github.com/ckennetha/intermol" },
  { name: Mail, path: "mailto:kennethasikinnn@gmail.com" }
]
</script>

<template>
  <Label as-child class="gap-x-3 px-[8px] py-[6px] text-base">
    <RouterLink to="/" class="!text-xl" style="text-decoration: none;">
      <img src="/intermol.svg" class="size-13"/>
      InterMol
    </RouterLink>
  </Label>
  <NavigationMenu disable-hover-trigger>
    <NavigationMenuList>
      <NavigationMenuItem>
        <NavigationMenuTrigger
          as-child
          class="!p-2 !bg-transparent !border-none shadow-none
            md:hidden hover:!bg-none"
        >
          <Button>
            <Menu class="size-6" />
          </Button>
        </NavigationMenuTrigger>
        <NavigationMenuContent class="nav p-[6px] md:hidden">
          <NavbarContent :navs="Navs"/>
        </NavigationMenuContent>
        <div class="hidden nav-md gap-x-1 md:flex">
          <NavbarContent :navs="Navs"/>
        </div>
      </NavigationMenuItem>
    </NavigationMenuList>
    <NavigationMenuViewport />
  </NavigationMenu>
</template>