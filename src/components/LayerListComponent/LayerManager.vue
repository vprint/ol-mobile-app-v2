<script setup lang="ts">
// Map imports

// Vue/Quasar imports

// Store imports

// Component import
import SidePanelComponent from '../SidePanelComponent/SidePanelComponent.vue';
import BackgroundSelector from './BackgroundSelector/BackgroundSelector.vue';
import AltLayerControler from './AltLayerControler.vue';

// Others imports
import { VueDraggable } from 'vue-draggable-plus';

// Type & interface
import { useLayerManagerStore } from 'src/stores/layer-manager-store';

// script
const lms = useLayerManagerStore();
</script>

<template>
  <SidePanelComponent
    @close="lms.isOpen ? lms.closeLayerManager() : lms.openLayerManager()"
  >
    <template #title> Layer Manager </template>
    <template #content>
      <VueDraggable
        v-model="lms.layersEntry"
        :animation="250"
        handle=".handle"
        ghost-class="layer-control-ghost"
        @end="lms.updateLayersEntryIndex()"
      >
        <div v-for="layer in lms.layersEntry" :key="layer.layerId">
          <AltLayerControler
            :layer-id="layer.layerId"
            class="layer-control"
          ></AltLayerControler>
        </div>
      </VueDraggable>
    </template>
    <template #floatingFooter>
      <BackgroundSelector></BackgroundSelector>
    </template>
  </SidePanelComponent>
</template>

<style lang="scss" scoped>
.layer-control {
  width: calc(100% - 16px);
  padding: 8px 16px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  transition: border-color 0.4s ease, background-color 0.4s ease;
  background-color: $light-highlight;
  border-radius: 10px;
  margin: 8px;

  &:hover {
    background: color-mix(in srgb, $gradient-cold 10%, transparent);
    border-color: rgba(0, 0, 0, 0.85);
  }
}

.layer-control-ghost {
  .layer-control {
    background-color: red;
  }
}
</style>
