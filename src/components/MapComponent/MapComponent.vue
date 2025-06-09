<script setup lang="ts">
// Vue/Quasar imports
import { onMounted } from 'vue';

// Component imports
import ContextMenuComponent from '../ContextMenuComponent/ContextMenuComponent.vue';
import GeometryManager from '../GeometryManagerComponent/GeometryManager.vue';

// Store imports
import { useMapStore } from 'src/stores/map-store';
import { useSiteStore } from 'src/stores/site-store';

// Map imports

// Others imports

// Script
onMounted(() => {
  useMapStore().initializeMap();
  useSiteStore().initializeStore();
});
</script>

<template>
  <div id="map" class="map">
    <ContextMenuComponent></ContextMenuComponent>
    <GeometryManager></GeometryManager>
  </div>

  <router-view v-slot="{ Component }">
    <component :is="Component" />
  </router-view>
</template>

<style lang="scss">
@import 'ol/ol.css';

#map {
  position: absolute;
  height: 100%;
  width: 100%;
  background-color: lightgrey;
}

.ol-attribution.ol-uncollapsible {
  border-radius: 50%;
}

.ol-attribution.ol-collapsed {
  border-radius: 50%;
  background: none;
}

.attribution-icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.ol-attribution:not(.ol-collapsed) {
  border-radius: 50px;
  background-color: rgba(255, 255, 255, 0.9);
}

.ol-attribution ul {
  font-family: 'Merriweather', serif;
  font-optical-sizing: auto;
  font-weight: 300;
  font-style: normal;
  font-variation-settings: 'wdth' 100;
}

.ol-attribution button {
  border-radius: 50%;
  width: 24px;
  height: 24px;

  &:hover {
    cursor: pointer;
  }
  &:focus {
    box-shadow: 0 0 2px 2px rgb(0 150 255 / 100%);
    outline: none;
  }
}
</style>
