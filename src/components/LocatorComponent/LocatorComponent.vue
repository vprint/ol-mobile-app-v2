<script setup lang="ts">
import { useLocationStore } from 'src/stores/location-store';

// Vue/Quasar imports

// Store imports

// Map imports

// Others imports

// Script
const ls = useLocationStore();
</script>

<template>
  <q-btn
    unelevated
    :loading="ls.isLocationEnabled && !ls.islocationFound && !ls.hasError"
    :icon="ls.icon"
    :disable="ls.hasError"
    :class="{
      'app-button btn--no-hover': true,
      'is-active': ls.isLocationEnabled,
      'is-found': ls.isViewCentered,
    }"
    @click="ls.manageUserClick()"
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
      {{ ls.tooltip }}
    </q-tooltip>
  </q-btn>
</template>

<style lang="scss" scoped>
.app-button {
  &.is-found {
    color: $orange;
  }
}
</style>
