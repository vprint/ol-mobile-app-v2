<script setup lang="ts">
// Map imports
import BaseLayer from 'ol/layer/Base';

// Vue/Quasar imports
import { onMounted, Ref, ref } from 'vue';

// Store imports
import { useMapStore } from 'src/stores/map-store';

// Component import

// Others imports

// Type & interface
import { LAYER_PROPERTIES } from 'src/utils/params/layersParams';
import { ILayerProperties } from 'src/interface/ILayerParameters';

// script
const mas = useMapStore();

const visible = ref(false);
const opacity = ref(1);
const layer: Ref<BaseLayer | undefined> = ref(undefined);
const isDragging = ref(false);

let layerProperties: ILayerProperties;

const props = defineProps<{
  layerId: string;
}>();

const emit = defineEmits<(e: 'update:isDragging', value: boolean) => void>();

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

/**
 * Manage drag start
 */
function startDragging(): void {
  isDragging.value = true;
  emit('update:isDragging', true);
}

/**
 * Manage drag stop
 */
function stopDragging(): void {
  isDragging.value = false;
  emit('update:isDragging', false);
}
</script>

<template>
  <div v-if="layer" class="layer-entry-element">
    <!-- Title -->
    <p class="merriweather layer-title">{{ layerProperties.title }}</p>
    <div class="layer-parameters">
      <!-- zIndex modifier-->
      <q-btn
        flat
        dense
        round
        icon="sym_o_expand_all"
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
          style="border-radius: 0"
          class="merriweather"
        >
          Drag to change layer order
        </q-tooltip>
      </q-btn>
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
        size="md"
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
          style="border-radius: 0"
          class="merriweather"
        >
          {{ !visible ? 'Show layer' : 'Hide layer' }}
        </q-tooltip>
      </q-checkbox>
    </div>
  </div>

  <!-- Layer information expansion panel-->
  <q-expansion-item
    expand-separator
    switch-toggle-side
    dense-toggle
    label="Description"
    class="secondary-text"
    :content-inset-level="0.5"
  >
    <q-card>
      <q-card-section class="tertiary-text">
        {{ layerProperties.description ?? '' }}
      </q-card-section>
    </q-card>
  </q-expansion-item>
</template>

<style lang="scss">
.layer-entry-element {
  padding: 5px 0;

  &:hover {
    background: color-mix(in srgb, $gradient-cold 10%, transparent);
  }

  .layer-title {
    font-size: 0.9rem;
    margin: 3px 15px;
  }

  .layer-parameters {
    position: relative;
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 0 10px;

    .visibility-checkbox {
    }

    .opacity-slider {
      padding: 0 15px;
    }

    .index-modifier {
      flex: 0 0 auto;
    }
  }

  .secondary-text {
    font-size: 0.75rem;
    font-weight: 400;
    line-height: 1.25rem;
    letter-spacing: 0.03333em;
    color: rgba(0, 0, 0, 0.5);
  }

  .tertiary-text {
    font-size: 0.75rem;
    font-weight: 400;
  }
}

.grab {
  cursor: grab;
}
</style>
