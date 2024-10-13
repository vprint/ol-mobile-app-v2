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
const { getLayerById } = useMapStore();

const visible = ref(false);
const opacity = ref(1);
const layer: Ref<BaseLayer | undefined> = ref(undefined);
const isDragging = ref(false);

let layerProperties: ILayerProperties;

const props = defineProps<{
  layerId: string;
}>();

onMounted(() => {
  layer.value = getLayerById(props.layerId);

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
}

/**
 * Manage drag stop
 */
function stopDragging(): void {
  isDragging.value = false;
}
</script>

<template>
  <div v-if="layer" class="layer-div">
    <!-- Title -->
    <p class="merriweather layer-title">{{ layerProperties.title }}</p>

    <div class="layer-control">
      <!-- Visibility checkbox -->
      <q-checkbox
        v-model="visible"
        checked-icon="sym_o_visibility"
        unchecked-icon="sym_o_visibility_off"
        size="xl"
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

      <!-- Opacity slider -->
      <q-slider
        v-model="opacity"
        :min="0"
        :max="1"
        :step="0.01"
        :disable="!visible"
        @update:model-value="updateOpacity"
      />

      <!-- zIndex modifier-->
      <q-icon
        name="sym_o_expand_all"
        class="handle cursor-move expand-icon"
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
      </q-icon>
    </div>

    <!-- Layer information expansion panel-->
    <q-expansion-item
      caption="Information and legend"
      class="expansion-panel merriweather"
    >
      <q-expansion-item
        expand-separator
        switch-toggle-side
        dense-toggle
        label="Description"
        class="secondary-text"
        :content-inset-level="0.5"
      >
        <q-card>
          <q-card-section class="description-card tertiary-text">
            {{ layerProperties.description }}
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </q-expansion-item>
  </div>
</template>

<style lang="scss">
.layer-div {
  margin: 5px 0px 0px 30px;
  position: relative;
  align-items: center;
  left: -15px;
  padding: 10px 0px 0px 10px;
}

.layer-control {
  position: relative;
  display: flex;
  align-items: center;
  left: -15px;
}

.expand-icon {
  margin-left: 30px;
}

.layer-title {
  font-size: medium;
  margin: 0px;
}

.expansion-panel {
  position: relative;
  top: -10px;
}

.description-card {
  background-color: $secondary;
}

.secondary-text {
  font-size: 0.75rem;
  font-weight: 400;
  line-height: 1.25rem;
  letter-spacing: 0.03333em;
  color: rgba(0, 0, 0, 0.54);
}

.tertiary-text {
  font-size: 0.75rem;
  font-weight: 400;
}
</style>
