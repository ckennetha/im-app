<script setup lang="ts">
import { Menu, Github } from "lucide-vue-next"
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

const navItems = [
  { name: "Explore", path: "/explore" },
  { name: "Search", path: "/search" },
  { name: "About", path: "/about" },
  { name: "Preprint", path: "https://doi.org/10.48550/arXiv.2606.23443" },
  { name: "Contact", path: "mailto:kennethasikinnn@gmail.com" },
  { name: Github, path: "https://github.com/ckennetha/intermol" },
]
</script>

<template>
  <Label as-child class="gap-x-3 px-2 py-1">
    <RouterLink to="/" class="!text-xl tracking-tight" style="text-decoration: none;">
      <img src="/intermol.svg" class="size-11"/>
      InterMol
    </RouterLink>
  </Label>
  <NavigationMenu disable-hover-trigger>
    <NavigationMenuList>
      <NavigationMenuItem>
        <NavigationMenuTrigger as-child
          class="!p-2 !bg-transparent hover:!bg-none !border-none shadow-none md:hidden"
        >
          <Button>
            <Menu class="size-5" />
          </Button>
        </NavigationMenuTrigger>
        <NavigationMenuContent class="nav md:hidden">
          <NavbarContent :navItems />
        </NavigationMenuContent>
        <div class="nav hidden md:gap-x-2 md:flex">
          <NavbarContent :navItems />
        </div>
      </NavigationMenuItem>
    </NavigationMenuList>
    <NavigationMenuViewport />
  </NavigationMenu>
</template>