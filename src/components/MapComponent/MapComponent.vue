<script setup lang="ts">
// Map imports
import Map from 'ol/Map';
import { MAPSETTINGS } from '../../utils/params/mapParams';
import { View } from 'ol';
import { fromLonLat } from 'ol/proj';
import { LayerImporter } from '../../utils/LayerImporter';
import { BACKGROUND_LAYERS_SETTINGS } from '../../utils/params/layersParams';

// Vue/Quasar imports
import { onMounted } from 'vue';

// Store imports
import { useMapStore } from '../../stores/map-store';

// Components

// Others imports

// Script

const { setMap } = useMapStore();

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
  });

  setMap(map);
});
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page>
        <div id="map" class="map"></div>
        <router-view />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style lang="scss" scoped>
@import 'ol/ol.css';

#map {
  position: fixed;
  height: 100%;
  width: 100%;
}
</style>
