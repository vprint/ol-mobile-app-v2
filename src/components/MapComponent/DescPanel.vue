<script setup lang="ts">
// Map imports

// Vue/Quasar imports

// Store imports
import { storeToRefs } from 'pinia';
import { useSiteStore } from 'src/stores/site-store';
// Others imports

// script
const { site } = storeToRefs(useSiteStore());
</script>

<template>
  <q-card class="application-card" square> {{ site }} </q-card>
</template>

<style lang="scss" scoped></style>
