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
    :fab="$q.platform.is.desktop"
    :round="$q.platform.is.mobile"
    :square="$q.platform.is.desktop"
    :color="lms.isActive ? 'primary' : 'secondary'"
    :text-color="lms.isActive ? 'secondary' : 'primary'"
    icon="sym_s_stacks"
    class="icon-weight-thin"
    unelevated
    @click="lms.isActive ? lms.closeLayerManager() : lms.openLayerManager()"
  />
</template>

<style lang="scss"></style>
