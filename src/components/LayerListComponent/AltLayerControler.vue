<script setup lang="ts">
// Map imports
import BaseLayer from 'ol/layer/Base';

// Vue/Quasar imports
import { onMounted, Ref, ref } from 'vue';

// Store imports
import { useMapStore } from 'src/stores/map-store';

// Type & interface import
import { LAYER_PROPERTIES } from 'src/utils/params/layersParams';
import { ILayerProperties } from 'src/interface/ILayerParameters';

const mas = useMapStore();

const visible = ref(false);
const opacity = ref(1);

// TODO: REFAIRE EN URGENCE CAR TRES LOURD !!!!!
const layer: Ref<BaseLayer | undefined> = ref(undefined);
const isDragging = ref(false);

let layerProperties: ILayerProperties;

const props = defineProps<{
  layerId: string;
}>();

onMounted(() => {
  layer.value = mas.getLayerById(props.layerId);

  if (layer.value) {
    layerProperties = layer.value.get(LAYER_PROPERTIES);
    visible.value = layer.value.getVisible();
    opacity.value = layer.value.getOpacity();
  }
});

function updateOpacity(newOpacity: number | null): void {
  if (typeof newOpacity === 'number') {
    opacity.value = newOpacity;
    layer.value?.setOpacity(newOpacity);
  }
}

function updateVisibility(newVisibility: boolean): void {
  visible.value = newVisibility;
  layer.value?.setVisible(newVisibility);
}

function startDragging(): void {
  isDragging.value = true;
}

function stopDragging(): void {
  isDragging.value = false;
}
</script>

<template>
  <div v-if="layer" class="layer-element merriweather">
    <div class="layer-title">
      {{ layerProperties.title }}
    </div>

    <q-expansion-item expand-icon-toggle dense class="expansion-panel">
      <template #header>
        <div class="layer-parameters">
          <!-- zIndex modifier-->
          <q-icon
            name="sym_o_swap_vert"
            class="handle cursor-move grab index-modifier"
            @mousedown="startDragging"
            @mouseup="stopDragging"
            @mouseleave="stopDragging"
          >
            <q-tooltip
              v-if="!isDragging"
              anchor="bottom middle"
              self="bottom middle"
              :offset="[0, 40]"
              transition-show="scale"
              transition-hide="scale"
              :delay="1000"
              class="merriweather"
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
              class="merriweather"
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
    }

    .layer-description {
      padding: 8px 16px;
    }
  }
}
</style>
