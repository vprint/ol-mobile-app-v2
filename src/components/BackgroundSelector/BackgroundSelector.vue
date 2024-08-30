<script setup lang="ts">
// Map imports
import { MapLibreLayer } from '@geoblocks/ol-maplibre-layer';

// Vue/Quasar imports
import { onMounted, ref } from 'vue';

// Store imports
import { useMapStore } from 'src/stores/map-store';

// Component import

// Others imports

// Type & interface

// Script
import {
  BACKGROUND_LAYERS_SETTINGS,
  IBackgroundLayer,
} from 'src/utils/params/layersParams';

const { getLayerById } = useMapStore();
const activeLayer = ref('');

/**
 * Set the active background layer
 */
function setActive(layerInformation: IBackgroundLayer): void {
  activeLayer.value = layerInformation.layerId;

  setTimeout(() => {
    const mapLibreLayer = getLayerById('maplibre-layer') as
      | MapLibreLayer
      | undefined;
    mapLibreLayer?.setVisible(false);

    BACKGROUND_LAYERS_SETTINGS.forEach((background) => {
      if (!background.vector)
        getLayerById(background.layerId)?.setVisible(false);
    });

    if (layerInformation.vector) {
      mapLibreLayer?.setVisible(true);
      mapLibreLayer?.mapLibreMap?.setStyle(
        `${layerInformation.url}?access-token=${layerInformation.token}`
      );
    } else {
      const layer = getLayerById(layerInformation.layerId);
      layer?.setVisible(true);
    }
  }, 100);
}

onMounted(() => {
  const LayerOfInterest = BACKGROUND_LAYERS_SETTINGS.find(
    (layer) => layer.visible
  );

  if (LayerOfInterest) activeLayer.value = LayerOfInterest.layerId;
});
</script>

<template>
  <div class="q-pa-xs column-row-wrapping">
    <div class="column">
      <div v-for="layer in BACKGROUND_LAYERS_SETTINGS" :key="layer.layerId">
        <div
          class="col-3 col-sm-10 layer-column flex flex-center justify-center"
        >
          <q-btn
            round
            class="round-button"
            :class="{
              active: activeLayer === layer.layerId,
            }"
            @click="setActive(layer)"
          >
            <q-avatar class="round-avatar">
              <img
                v-if="layer.token"
                :src="`${layer.img}access-token=${layer.token}`"
              />
              <img v-else :src="`${layer.img}`" />
            </q-avatar>
          </q-btn>
        </div>

        <div class="col-3 col-sm-2">
          <p class="q-ma-xs merriweather flex flex-center justify-center">
            {{ layer.name }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.column-row-wrapping {
  .column {
    height: 100px;
  }
  .column > div {
    background: $secondary;
  }
  .column + .column {
    margin-top: 1rem;
  }
}

.round-button {
  margin: 2px;
  box-shadow: 0 0 0 2px transparent;
  transition: box-shadow 0.15s ease;
  &.active {
    box-shadow: 0 0 0 3px $primary;
  }
}

.layer-title {
  text-align: center;
}

.round-avatar {
  margin: 2px;
}
</style>
