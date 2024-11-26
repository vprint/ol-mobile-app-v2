<script setup lang="ts">
// Map imports

// Vue/Quasar imports
import { onMounted, Ref, ref, watch } from 'vue';

// Store imports
import { useMapStore } from 'src/stores/map-store';

// Component import
import SidePanelComponent from '../SidePanelComponent/SidePanelComponent.vue';
import BackgroundSelector from './BackgroundSelector/BackgroundSelector.vue';
import LayerControler from './LayerControler.vue';

// Others imports
import { VueDraggable } from 'vue-draggable-plus';

// Type & interface
import { ILayerProperties } from 'src/interface/ILayerParameters';
import { LAYER_PROPERTIES } from 'src/utils/params/layersParams';
import { useLayerManagerStore } from 'src/stores/layer-manager-store';

// script
interface ILayerIndex {
  layerId: string;
  zIndex: number;
}

const mas = useMapStore();
const lms = useLayerManagerStore();

const layers: Ref<ILayerIndex[]> = ref([]);

onMounted(() => {
  getTunableLayers();
});

/**
 * Get all tunable layers.
 */
function getTunableLayers(): void {
  const mapLayers = mas.map.getAllLayers();

  mapLayers.forEach((layer) => {
    const layerProperties = layer.get(LAYER_PROPERTIES) as
      | ILayerProperties
      | undefined;
    const zIndex = layer.getZIndex();

    if (layerProperties?.tunable) {
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
 * This function sort layers by index after user reordering.
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
  const layersCount = layers.value.length;

  layers.value.forEach((layer, index) => {
    const newZIndex = layersCount - index;
    layer.zIndex = newZIndex;
    mas.getLayerById(layer.layerId)?.setZIndex(newZIndex);
  });
}

/**
 * Watch for map initialization and then enable the layer tree.
 */
watch(
  () => mas.isMapInitialized,
  (isInitialized) => {
    if (isInitialized) {
      getTunableLayers();
    }
  }
);
</script>

<template>
  <SidePanelComponent
    @close="lms.isActive ? lms.closeLayerManager() : lms.openLayerManager()"
  >
    <template #title> Layer Manager </template>
    <template #component>
      <VueDraggable
        v-model="layers"
        :animation="250"
        handle=".handle"
        ghost-class="ghost"
        @end="onEnd"
      >
        <div v-for="layer in layers" :key="layer.layerId">
          <LayerControler :layer-id="layer.layerId"></LayerControler>
          <q-separator></q-separator>
        </div>
      </VueDraggable>
    </template>
    <template #footer>
      <BackgroundSelector></BackgroundSelector>
    </template>
  </SidePanelComponent>
</template>

<style lang="scss"></style>
