<script setup lang="ts">
// Vue/Quasar imports
import { onMounted, ref, Ref } from 'vue';

// Component imports
import ContextMenuComponent from '../ContextMenuComponent/ContextMenuComponent.vue';
import OverlayComponent from '../OverlayComponent/OverlayComponent.vue';

// Store imports
import { useMapStore } from '../../stores/map-store';
import { useMapInteractionStore } from '../../stores/map-interaction-store';

// Map imports
import Map from 'ol/Map';
import { MAPSETTINGS } from '../../utils/params/mapParams';
import { View } from 'ol';
import { fromLonLat } from 'ol/proj';
import { importLayer } from '../../plugins/LayerImporter';
import {
  BACKGROUND_LAYERS_SETTINGS,
  VECTOR_TILE_LAYERS_SETTINGS,
  RASTER_LAYERS_SETTINGS,
} from '../../utils/params/layersParams';
import addControlers from 'src/plugins/ControlersCreator';

// Others imports

// Script
const { setMap } = useMapStore();
const { initializeInteractions } = useMapInteractionStore();
const map: Ref<Map | undefined> = ref(undefined);

onMounted(() => {
  map.value = new Map({
    controls: [],
    target: 'map',
    view: new View({
      center: fromLonLat([MAPSETTINGS.long, MAPSETTINGS.lat]),
      zoom: MAPSETTINGS.zoom,
      maxZoom: MAPSETTINGS.maxzoom,
      minZoom: MAPSETTINGS.minzoom,
    }),
  });

  importLayer({
    map: map.value,
    backgroundLayers: BACKGROUND_LAYERS_SETTINGS,
    vectorTileLayers: VECTOR_TILE_LAYERS_SETTINGS,
    rasterLayers: RASTER_LAYERS_SETTINGS,
  });

  setMap(map.value);
  addControlers(map.value);
  initializeInteractions();
});
</script>

<template>
  <OverlayComponent v-if="map"></OverlayComponent>

  <div id="map" class="map">
    <ContextMenuComponent></ContextMenuComponent>
  </div>
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
  position: absolute;
  height: 100%;
  width: 100%;
}
</style>
src/utils/VectorTileSelector ../../plugins/LayerImporter
