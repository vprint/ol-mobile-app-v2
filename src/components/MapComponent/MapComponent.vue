<script setup lang="ts">
// Vue/Quasar imports
import { onMounted, ref, Ref } from 'vue';

// Component imports
import ContextMenuComponent from '../ContextMenuComponent/ContextMenuComponent.vue';

// Store imports
import { useMapStore } from '../../stores/map-store';
import { useMapInteractionStore } from '../../stores/map-interaction-store';

// Map imports
import Map from 'ol/Map';
import { MAPSETTINGS } from '../../utils/params/mapParams';
import { View } from 'ol';
import { fromLonLat } from 'ol/proj';
import {
  addMeasureLayer,
  addOGCLayer,
  addRasterBackgroundLayers,
  addVectorBackgroundLayers,
  addVectorTileLayers,
} from '../../plugins/LayerImporter';
import {
  BACKGROUND_LAYERS_SETTINGS,
  VECTOR_TILE_LAYERS_SETTINGS,
  RASTER_LAYERS_SETTINGS,
} from '../../utils/params/layersParams';
import addControllers from 'src/plugins/ControllersCreator';
import { MapLibreLayer } from '@geoblocks/ol-maplibre-layer';
import { ILayerProperties } from 'src/interface/ILayerParameters';

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

  // An empty mapLibre layer is added to the map
  const mapLibreLayer = new MapLibreLayer({
    mapLibreOptions: {},
    zIndex: 0,
    properties: {
      layerProperties: {
        id: 'maplibre-layer',
        title: 'maplibre-layer',
        tunable: false,
      } as ILayerProperties,
    },
  });
  map.value.addLayer(mapLibreLayer);

  /**
   * Add the application layers.
   */
  addVectorBackgroundLayers(mapLibreLayer, BACKGROUND_LAYERS_SETTINGS);
  addRasterBackgroundLayers(map.value, BACKGROUND_LAYERS_SETTINGS);
  addVectorTileLayers(map.value, VECTOR_TILE_LAYERS_SETTINGS);
  addOGCLayer(map.value, RASTER_LAYERS_SETTINGS);
  // TODO: Déplacer ailleurs
  addMeasureLayer(map.value);

  setMap(map.value);
  addControllers(map.value);
  initializeInteractions();
});
</script>

<template>
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
  background-color: lightgrey;
}
</style>
src/plugins/ControllersCreator
