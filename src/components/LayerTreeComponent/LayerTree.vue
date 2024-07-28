<script setup lang="ts">
// Map imports

// Vue/Quasar imports
import { onMounted, Ref, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

// Store imports
import { useMapStore } from 'src/stores/map-store';

// Component import
import PanelComponent from '../ReusableComponents/PanelComponent.vue';
import LayerControler from './LayerControler.vue';

// Others imports
import { VueDraggable } from 'vue-draggable-plus';

// Type & interface
import { ILayerProperties } from 'src/interface/ILayerParameters';
import { LAYER_PROPERTIES } from 'src/utils/params/layersParams';

// script
interface ILayerIndex {
  layerId: string;
  zIndex: number;
}

const { map, isMapInitialized } = storeToRefs(useMapStore());
const { getLayerById } = useMapStore();
const layers: Ref<ILayerIndex[]> = ref([]);

onMounted(() => {
  getTunableLayers();
});

/**
 * Get all tunable layers.
 */
function getTunableLayers(): void {
  const mapLayers = map.value.getAllLayers();

  mapLayers.forEach((layer) => {
    const layerProperties = layer.get(LAYER_PROPERTIES) as ILayerProperties;
    const zIndex = layer.getZIndex();

    if (layerProperties.tunable) {
      const layerInformation = {
        layerId: layerProperties.id,
        zIndex: zIndex ? zIndex : 0,
      };

      layers.value.push(layerInformation);
      sortLayersByIndex(layers.value);
    }
  });
}

/**
 * This function sort layers by index
 * @param layerlist list of layers to sort
 */
function sortLayersByIndex(layerlist: ILayerIndex[]): ILayerIndex[] {
  layerlist.sort((a, b) => b.zIndex - a.zIndex);
  return layerlist;
}

/**
 * Drag end event manager
 */
function onEnd(): void {
  const reversedLayers = layers.value.slice().reverse();
  let i = 1;

  reversedLayers.forEach((layer) => {
    layer.zIndex = i;
    getLayerById(layer.layerId)?.setZIndex(i);
    i++;
  });
}

/**
 * Watch for map initialization and then enable the layer tree.
 */
watch(
  () => isMapInitialized.value,
  (isInitialized) => {
    if (isInitialized) {
      getTunableLayers();
    }
  }
);
</script>

<template>
  <PanelComponent>
    <template #title> Layer Manager </template>
    <template #component>
      <VueDraggable
        v-model="layers"
        :animation="250"
        handle=".handle"
        @end="onEnd"
      >
        <div v-for="layer in layers" :key="layer.layerId">
          <LayerControler :layer-id="layer.layerId"></LayerControler>
          <q-separator></q-separator>
        </div>
      </VueDraggable>
    </template>
  </PanelComponent>
</template>

<style lang="scss"></style>
