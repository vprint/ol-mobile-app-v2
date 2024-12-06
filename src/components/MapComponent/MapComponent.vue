<script setup lang="ts">
// Vue/Quasar imports
import { onMounted } from 'vue';

// Component imports
import ContextMenuComponent from '../ContextMenuComponent/ContextMenuComponent.vue';
import GeometryManager from '../GeometryManagerComponent/GeometryManager.vue';

// Store imports
import { useMapStore } from 'src/stores/map-store';

// Map imports

// Others imports

// Script
onMounted(() => {
  useMapStore().initializeMap();
});
</script>

<template>
  <div id="map" class="map">
    <ContextMenuComponent></ContextMenuComponent>
    <GeometryManager></GeometryManager>
  </div>
  <transition
    appear
    enter-active-class="animated fadeInLeftBig"
    leave-active-class="animated fadeOutLeftBig"
  >
    <router-view />
  </transition>
</template>

<style lang="scss">
@import 'ol/ol.css';

#map {
  position: absolute;
  height: 100%;
  width: 100%;
  background-color: lightgrey;
}
</style>
