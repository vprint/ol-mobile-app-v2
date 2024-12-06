<script setup lang="ts">
// vue/pinia import

// Store import
import { useLayerManagerStore } from 'src/stores/layer-manager-store';

// Component import

// Others

// Script
const lms = useLayerManagerStore();
</script>

<template>
  <q-btn
    flat
    unelevated
    icon="sym_s_stacks"
    :class="{
      'app-button btn--no-hover': true,
      'is-active': lms.isOpen,
    }"
    @click="lms.isOpen ? lms.closeLayerManager() : lms.openLayerManager()"
  >
    <q-tooltip
      anchor="bottom middle"
      self="bottom middle"
      transition-show="scale"
      transition-hide="scale"
      :offset="[0, 40]"
      :delay="1000"
      style="border-radius: 0"
    >
      Manage layers
    </q-tooltip></q-btn
  >
</template>

<style lang="scss" scoped></style>
