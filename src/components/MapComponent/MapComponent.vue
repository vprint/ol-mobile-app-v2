<script setup lang="ts">
// Vue/Quasar imports
import { onMounted } from 'vue';

// Store imports
import { useMapStore } from '../../stores/map-store';
import { useMapInteractionStore } from '../../stores/map-interaction-store';

// Map imports
import Map from 'ol/Map';
import { MAPSETTINGS } from '../../utils/params/mapParams';
import { View } from 'ol';
import { fromLonLat } from 'ol/proj';
import { LayerImporter } from '../../utils/LayerImporter';
import {
  BACKGROUND_LAYERS_SETTINGS,
  VECTOR_TILE_LAYERS_SETTINGS,
} from '../../utils/params/layersParams';

// Others imports

// Script
const { setMap } = useMapStore();
const { initializeInteractions } = useMapInteractionStore();

onMounted(() => {
  const map = new Map({
    controls: [],
    target: 'map',
    view: new View({
      center: fromLonLat([MAPSETTINGS.long, MAPSETTINGS.lat]),
      zoom: MAPSETTINGS.zoom,
      maxZoom: MAPSETTINGS.maxzoom,
      minZoom: MAPSETTINGS.minzoom,
    }),
  });

  LayerImporter({
    map: map,
    backgroundLayers: BACKGROUND_LAYERS_SETTINGS,
    vectorTileLayers: VECTOR_TILE_LAYERS_SETTINGS,
  });

  setMap(map);

  initializeInteractions();
});
</script>

<template>
  <div id="map" class="map"></div>
  <transition
    appear
    enter-active-class="animated fadeInRightBig"
    leave-active-class="animated fadeOutRightBig"
  >
    <router-view />
  </transition>
</template>

<style lang="scss">
@import 'ol/ol.css';

#map {
  position: fixed;
  height: 100%;
  width: 100%;
}
</style>
src/utils/VectorTileSelector
