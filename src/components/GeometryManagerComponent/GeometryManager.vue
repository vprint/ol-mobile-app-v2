<script setup lang="ts">
// Map imports

// Vue/Quasar imports

// Store imports
import { useDrawStore } from 'src/stores/draw-store';

// Interface, type and enum imports

// Others imports

// script
const drs = useDrawStore();

const geometryManagerButtons = [
  {
    action: (): void => drs.createNewPolygon(),
    icon: 'sym_o_pentagon',
  },
  {
    action: (): void => drs.createNewLine(),
    icon: 'sym_o_timeline',
  },
  {
    action: (): void => drs.createNewPoint(),
    icon: 'sym_o_point_scan',
  },
  {
    action: (): void => drs.undoModification(),
    icon: 'sym_o_undo',
  },
  {
    action: (): void => drs.RedoModification(),
    icon: 'sym_o_redo',
  },
  {
    action: (): void => drs.deleteDraw(),
    icon: 'sym_o_delete',
  },
];
</script>

<template>
  <div v-if="drs.isVisible" class="q-pa-md draw-container">
    <q-btn-group rounded class="app-button-group">
      <q-btn
        v-for="(button, index) in geometryManagerButtons"
        :key="index"
        rounded
        class="app-button btn--no-hover"
        @click="button.action"
      >
        <q-icon :name="button.icon" />
      </q-btn>
    </q-btn-group>
  </div>
</template>

<style lang="scss" scoped>
.draw-container {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 0;
  z-index: 2;

  .app-button-group {
    background: $gradient;
    min-height: 48px;

    .draw-separator {
      background-color: rgba($secondary, 20%);
    }
  }
}
</style>
