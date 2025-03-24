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

  <router-view v-slot="{ Component }">
    <transition
      appear
      enter-active-class="animated fadeInLeftBig"
      leave-active-class="animated fadeOutLeftBig"
    >
      <component :is="Component" />
    </transition>
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

.ol-attribution button {
  border-radius: 50%;
  width: 24px;
  height: 24px;
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
}

.ol-attribution ul {
  font-family: 'Playfair Display', serif;
}

.ol-attribution button:focus {
  box-shadow: 0 0 2px 2px rgb(0 150 255 / 100%);
  outline: none;
}
</style>
