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
import { computed, ref } from 'vue';

// script
const LAYER_ENTRY_HEIGHT = 80;
const SIDE_PANEL_MAX_HEIGHT = 1000;
const SIDE_PANEL_MIN_HEIGHT = 460;

const lms = useLayerManagerStore();
const isDragging = ref(false);

function manageDragEnd(): void {
  isDragging.value = false;
  lms.updateLayersEntryIndex();
}

function manageDragStart(): void {
  isDragging.value = true;
}

const SidePanelHeight = computed(() => {
  let size = LAYER_ENTRY_HEIGHT * lms.layersEntry.length;

  if (size > SIDE_PANEL_MAX_HEIGHT) {
    size = SIDE_PANEL_MAX_HEIGHT;
  }

  if (size < SIDE_PANEL_MIN_HEIGHT) {
    size = SIDE_PANEL_MIN_HEIGHT;
  }

  return size;
});
</script>

<template>
  <SidePanelComponent
    :height="SidePanelHeight"
    @close="lms.isOpen ? lms.closeLayerManager() : lms.openLayerManager()"
  >
    <template #title> Layer Manager </template>
    <template #content>
      <VueDraggable
        v-model="lms.layersEntry"
        :animation="250"
        handle=".handle"
        ghost-class="selected"
        drag-class="dragged"
        @start="manageDragStart"
        @end="manageDragEnd"
      >
        <div v-for="layer in lms.layersEntry" :key="layer.layerId">
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
