<script setup lang="ts">
// Map imports

// Vue/Quasar imports
import { onMounted, Ref, ref } from 'vue';
import { storeToRefs } from 'pinia';

// Store imports
import { useMapStore } from 'src/stores/map-store';

// Component import
import PanelComponent from '../ReusableComponents/PanelComponent.vue';
import LayerControler from './LayerControler.vue';

// Others imports
import { VueDraggable } from 'vue-draggable-plus';

// Type & interface

// script
const { map } = storeToRefs(useMapStore());

interface ILayerList {
  name: string;
  id: number;
}
const layers: Ref<ILayerList[]> = ref([]);

onMounted(() => {
  const mapLayers = map.value.getAllLayers();
  let i = 1;

  mapLayers.forEach((layer) => {
    const layerInformation = {
      name: layer.get('name') as string,
      id: i,
    };

    i++;
    layers.value.push(layerInformation);
  });
});
</script>

<template>
  <PanelComponent>
    <template #title> Layer Manager </template>
    <template #component>
      <VueDraggable v-model="layers" :animation="250" handle=".handle">
        <div v-for="layer in layers" :key="layer.id">
          <LayerControler :layer-name="layer.name"></LayerControler>
          <q-separator></q-separator>
        </div>
      </VueDraggable>
    </template>
  </PanelComponent>
</template>

<style lang="scss"></style>
