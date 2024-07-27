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

// script
const { getLayerByName } = useMapStore();

const visible = ref(false);
const opacity = ref(1);
const layer: Ref<BaseLayer | undefined> = ref(undefined);

const props = defineProps<{
  layerName: string;
}>();

onMounted(() => {
  layer.value = getLayerByName(props.layerName);

  if (layer.value) {
    visible.value = layer.value.getVisible();
    opacity.value = layer.value.getOpacity();
  }
});

function updateOpacity(newOpacity: number | null): void {
  if (newOpacity) {
    opacity.value = newOpacity;
    layer.value?.setOpacity(newOpacity);
  }
}

function updateVisibility(newVisibility: boolean): void {
  visible.value = newVisibility;
  layer.value?.setVisible(newVisibility);
}
</script>

<template>
  <div v-if="layer" class="layer-div">
    <!-- Title -->
    <p class="merriweather">{{ layer.get('name') }}</p>

    <div class="layer-control">
      <!-- Checkbox de visibilité -->
      <q-checkbox
        v-model="visible"
        checked-icon="sym_o_visibility"
        unchecked-icon="sym_o_visibility_off"
        size="xl"
        @update:model-value="updateVisibility"
      />

      <!-- Slider d'opacité -->
      <q-slider
        v-model="opacity"
        :min="0"
        :max="1"
        :step="0.01"
        @update:model-value="updateOpacity"
      />

      <!-- Modificateur d'index de couche-->
      <q-icon
        name="sym_o_expand_all"
        class="handle cursor-move up-down-buttons"
      />
    </div>
  </div>
  <!-- Controlleur de couche -->
</template>

<style lang="scss">
.layer-div {
  margin: 5px 30px 0px 10px;
  position: relative;
  align-items: center;
  left: -15px;
  padding: 10px 0px 0px 10px;
}

.layer-control {
  position: relative;
  display: flex;
  align-items: center;
}

.up-down-buttons {
  position: relative;
  left: 40px;
}
</style>
