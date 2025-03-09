<script setup lang="ts">
// Map imports

// Vue/Quasar imports
import { onMounted, ref } from 'vue';

// Store imports
import { useMapStore } from 'src/stores/map-store';

// Component import

// Others imports

// Type & interface
import { IBackgroundLayerParameters } from 'src/interface/ILayers';

// enums
import { BACKGROUND_LAYERS_SETTINGS } from 'src/enums/layers.enum';

// Script
const mapStore = useMapStore();
const activeLayer = ref('');

/**
 * Set the active background layer
 */
function setActive(layerInformation: IBackgroundLayerParameters): void {
  activeLayer.value = layerInformation.layerId;
  BACKGROUND_LAYERS_SETTINGS.forEach((background) => {
    if (!background.vector)
      mapStore.getLayerById(background.layerId)?.setVisible(false);
  });

  const mapLibreInstance = mapStore.getMapLibreInstance();

  if (layerInformation.vector) {
    setTimeout(() => {
      mapLibreInstance?.setVisible(true);
      mapLibreInstance?.mapLibreMap?.setStyle(
        `${layerInformation.url}?access-token=${layerInformation.token}`
      );
    }, 100);
  } else {
    mapLibreInstance?.setVisible(false);
    const layer = mapStore.getLayerById(layerInformation.layerId);
    layer?.setVisible(true);
  }
}

onMounted(() => {
  const LayerOfInterest = BACKGROUND_LAYERS_SETTINGS.find(
    (layer) => layer.visible
  );

  if (LayerOfInterest) activeLayer.value = LayerOfInterest.layerId;
});
</script>

<template>
  <div class="row layers-container">
    <div
      v-for="layer in BACKGROUND_LAYERS_SETTINGS"
      :key="layer.layerId"
      class="col layer-column"
    >
      <q-btn
        round
        class="round-button"
        :class="{ active: activeLayer === layer.layerId }"
        @click="setActive(layer)"
      >
        <q-avatar size="50px" class="round-avatar">
          <img
            v-if="layer.token"
            :src="`${layer.img}access-token=${layer.token}`"
          />
          <img v-else :src="layer.img" />
        </q-avatar>
      </q-btn>
      <p class="q-ma-xs merriweather text-center">{{ layer.title }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.layers-container {
  padding: 10px 10px 0px 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.layer-column {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  align-items: center;
}

.round-button {
  margin-bottom: 10px;
  transition: box-shadow 0.15s ease;
  &.active {
    box-shadow: 0 0 0 3px $primary;
  }
}

.round-avatar {
  margin: 2px;
}

.text-center {
  text-align: center;
}
</style>
