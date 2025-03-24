<script setup lang="ts">
// Map imports
import BaseLayer from 'ol/layer/Base';

// Vue/Quasar imports
import { onMounted, ref } from 'vue';

// Store imports
import { useMapStore } from 'src/stores/map-store';

// Type & interface import
import { LAYER_PROPERTIES_FIELD, LayerIdentifier } from 'src/enums/layers.enum';
import { ILayerProperties } from 'src/interface/ILayerParameters';

const props = defineProps<{
  layerId: LayerIdentifier;
  /**
   * Relative to the layer manager (ie. an element is dragged in the layer manager).
   */
  isDragging: boolean;
}>();

const mas = useMapStore();
const visible = ref(false);
const isInitialized = ref(false);
const opacity = ref(1);

let layer: BaseLayer | undefined = undefined;
let layerProperties: ILayerProperties;

onMounted(() => {
  layer = mas.getLayerById(props.layerId);

  if (layer) {
    layerProperties = layer.get(LAYER_PROPERTIES_FIELD);
    visible.value = layer.getVisible();
    opacity.value = layer.getOpacity();
    addOpacityEventListeners(layer);
  }

  isInitialized.value = true;
});

/**
 * Listen for opacity change and update the opacity slider according to the new value.
 * This method is usefull if the layer opacity is changed from an other part of the application
 * @param layer - The layer to listen for.
 */
function addOpacityEventListeners(layer: BaseLayer): void {
  layer.on('change:opacity', () => {
    if (opacity.value !== layer.getOpacity()) {
      const layerOpacity = layer.getOpacity();
      if (layerOpacity) {
        opacity.value = layerOpacity;
      }
    }
  });
}

function updateOpacity(newOpacity: number | null): void {
  if (typeof newOpacity === 'number') {
    opacity.value = newOpacity;
    layer?.setOpacity(newOpacity);
  }
}

function updateVisibility(newVisibility: boolean): void {
  visible.value = newVisibility;
  layer?.setVisible(newVisibility);
}
</script>

<template>
  <div
    v-if="isInitialized"
    class="layer-element app-font"
    :class="{ hover: !isDragging }"
  >
    <div class="layer-title">
      {{ layerProperties.title }}
    </div>

    <q-expansion-item expand-icon-toggle dense class="expansion-panel">
      <template #header>
        <div class="layer-parameters">
          <!-- zIndex modifier-->
          <q-icon
            name="sym_o_swap_vert"
            class="handle cursor-move index-modifier"
          >
            <q-tooltip
              v-if="!isDragging"
              anchor="bottom middle"
              self="bottom middle"
              :offset="[0, 40]"
              transition-show="scale"
              transition-hide="scale"
              :delay="1000"
              class="app-font"
            >
              Drag to change layer order
            </q-tooltip>
          </q-icon>

          <!-- Opacity slider -->
          <q-slider
            v-model="opacity"
            :min="0"
            :max="1"
            :step="0.01"
            :disable="!visible"
            class="opacity-slider"
            @update:model-value="updateOpacity"
          />

          <!-- Visibility checkbox -->
          <q-checkbox
            v-model="visible"
            checked-icon="sym_o_visibility"
            unchecked-icon="sym_o_visibility_off"
            class="visibility-checkbox"
            @update:model-value="updateVisibility"
          >
            <q-tooltip
              anchor="bottom middle"
              self="bottom middle"
              :offset="[0, 40]"
              transition-show="scale"
              transition-hide="scale"
              :delay="1000"
              class="app-font"
            >
              {{ !visible ? 'Show layer' : 'Hide layer' }}
            </q-tooltip>
          </q-checkbox>
        </div>
      </template>

      <div class="layer-description">
        {{ layerProperties.description }}
      </div>
    </q-expansion-item>
  </div>
</template>

<style lang="scss" scoped>
.layer-element {
  width: calc(100% - 16px);
  padding: 8px 16px;
  background-color: $low-highlight;
  border: 1px solid transparent;
  transition: border-color 0.4s ease, background-color 0.2s ease,
    box-shadow 0.4s ease;
  border-radius: 8px;
  margin: 8px;

  .layer-title {
    font-size: 0.9rem;
  }

  .expansion-panel {
    width: 100%;

    :deep(.q-item) {
      padding: 0;
    }
    :deep(.q-item__section--side) {
      padding: 0;
    }

    .layer-parameters {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 16px;

      .opacity-slider {
        flex: 1;
      }

      .index-modifier {
        cursor: grab;
      }
    }

    .layer-description {
      padding: 8px 16px;
    }
  }
}

.hover {
  &:hover {
    border-color: rgba(0, 0, 0, 0.4);
  }
}
</style>
