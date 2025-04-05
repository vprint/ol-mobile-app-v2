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
import { ref } from 'vue';

const layerManagerStore = useLayerManagerStore();
const isDragging = ref(false);

function manageDragEnd(): void {
  isDragging.value = false;
  layerManagerStore.updateLayersEntryIndex();
}

function manageDragStart(): void {
  isDragging.value = true;
}
</script>

<template>
  <SidePanelComponent
    @close="
      layerManagerStore.isOpen
        ? layerManagerStore.closeLayerManager()
        : layerManagerStore.openLayerManager()
    "
  >
    <template #title> Layer Manager </template>
    <template #content>
      <VueDraggable
        v-model="layerManagerStore.layersEntry"
        :animation="250"
        handle=".handle"
        ghost-class="selected"
        drag-class="dragged"
        @start="manageDragStart"
        @end="manageDragEnd"
      >
        <div
          v-for="layer in layerManagerStore.layersEntry"
          :key="layer.layerId"
        >
          <LayerControler
            :layer-id="layer.layerId"
            :is-dragging="isDragging"
          ></LayerControler>
        </div>
      </VueDraggable>
    </template>
    <template #floatingFooter>
      <BackgroundSelector></BackgroundSelector>
    </template>
  </SidePanelComponent>
</template>

<style lang="scss" scoped>
.selected {
  .layer-element {
    border-color: rgba(0, 0, 0, 0.4);
    box-shadow: 0 3px 5px -1px rgba(0, 0, 0, 0.2), 0 5px 8px rgba(0, 0, 0, 0.14),
      0 1px 14px rgba(0, 0, 0, 0.12);
  }
}

.dragged {
  opacity: 0;
}
</style>
