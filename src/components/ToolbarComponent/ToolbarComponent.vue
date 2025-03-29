<script setup lang="ts">
// vue/pinia import
import { storeToRefs } from 'pinia';

// Store import
import { useMapStore } from 'src/stores/map-store';

// Component import
import SiteSearchBox from './SiteSearchBox.vue';
import MeasureComponent from '../MeasureComponent/MeasureComponent.vue';
import LayerManagerButton from '../LayerManagerComponent/LayerManagerButton.vue';
import LocatorComponent from '../LocatorComponent/LocatorComponent.vue';

// Others

// Script
const { isMapInitialized } = storeToRefs(useMapStore());
</script>

<template>
  <div v-if="isMapInitialized" class="text-primary search-toolbar shadow-2 row">
    <!-- Layer list button -->
    <LayerManagerButton></LayerManagerButton>

    <!-- Enable location -->
    <LocatorComponent></LocatorComponent>

    <!-- Measure button -->
    <MeasureComponent v-if="$q.platform.is.desktop"></MeasureComponent>

    <SiteSearchBox></SiteSearchBox>
  </div>
</template>

<style lang="scss" scoped>
.search-toolbar {
  position: absolute;
  right: 0;
  background: $gradient;
  margin: 8px;
  padding: 0px 5px 0px 0px;
  border-radius: 8px;
  z-index: 999;
  overflow: hidden;
}
</style>
