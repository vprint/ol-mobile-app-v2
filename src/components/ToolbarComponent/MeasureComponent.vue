<script setup lang="ts">
// Vue/Quasar imports

// Store import
import { useMapInteractionStore } from '../../stores/map-interaction-store';
import { storeToRefs } from 'pinia';

//Map import

// Other import

// Script
const { isMeasureActive } = storeToRefs(useMapInteractionStore());
const { enableMeasure } = useMapInteractionStore();

function test(yolo: boolean): void {
  console.log(isMeasureActive.value);
  enableMeasure(yolo);
}
</script>

<template>
  <q-btn flat fab icon="sym_s_straighten" @click="test(!isMeasureActive)">
    <q-tooltip
      anchor="bottom middle"
      self="bottom middle"
      transition-show="scale"
      transition-hide="scale"
      :delay="500"
      style="border-radius: 0"
    >
      Measure
    </q-tooltip>
  </q-btn>
</template>

<style lang="scss"></style>
