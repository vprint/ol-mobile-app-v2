<script setup lang="ts">
// Map imports

// Vue/Quasar imports

// Store imports

// Component import
import SidePanelComponent from '../SidePanelComponent/SidePanelComponent.vue';
import BackgroundSelector from './BackgroundSelector/BackgroundSelector.vue';
import LayerControler from './LayerControler.vue';

// Others imports
import { VueDraggable } from 'vue-draggable-plus';

// Type & interface
import { useLayerManagerStore } from 'src/stores/layer-manager-store';

// script
const lms = useLayerManagerStore();
</script>

<template>
  <SidePanelComponent
    @close="lms.isActive ? lms.closeLayerManager() : lms.openLayerManager()"
  >
    <template #title> Layer Manager </template>
    <template #component>
      <VueDraggable
        v-model="lms.layersEntry"
        :animation="250"
        handle=".handle"
        ghost-class="ghost"
        @end="lms.updateLayersEntryIndex()"
      >
        <div v-for="layer in lms.layersEntry" :key="layer.layerId">
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
