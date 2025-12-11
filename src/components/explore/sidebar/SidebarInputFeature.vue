<script setup lang="ts">
import { Label } from "@/components/ui/label"
import { NumberField, NumberFieldContent, NumberFieldDecrement, NumberFieldIncrement, NumberFieldInput } from "@/components/ui/number-field"
</script>

<template>
  <NumberField>
    <Label for="feature">Select a feature:</Label>
    <NumberFieldContent>
      <NumberFieldDecrement class="!rounded-e-none hover:bg-accent/50 active:bg-primary" />
      <NumberFieldInput id="feature" class="shadow-xs !bg-background"/>
      <NumberFieldIncrement class="!rounded-s-none hover:bg-accent/50 active:bg-primary" />
    </NumberFieldContent>
  </NumberField>
</template>