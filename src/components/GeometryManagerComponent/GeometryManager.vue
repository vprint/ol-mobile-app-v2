<script setup lang="ts">
import { useDrawStore } from 'src/stores/draw-store';

// Map imports

// Vue/Quasar imports

// Store imports

// Interface, type and enum imports

// Others imports

// script
const ds = useDrawStore();
</script>

<template>
  <div v-if="ds.isActive" class="q-pa-md draw-container">
    <q-btn-group rounded class="app-button-group">
      <q-btn
        rounded
        class="app-button btn--no-hover"
        @click="ds.createNewPolygon"
        ><q-icon name="sym_o_pentagon"
      /></q-btn>
      <q-btn rounded class="app-button btn--no-hover" @click="ds.createNewLine"
        ><q-icon name="sym_o_timeline"
      /></q-btn>
      <q-separator vertical class="draw-separator" />

      <q-btn
        rounded
        class="app-button btn--no-hover"
        @click="ds.undoModification"
        ><q-icon name="sym_o_undo"
      /></q-btn>
      <q-btn
        rounded
        class="app-button btn--no-hover"
        @click="ds.RedoModification"
        ><q-icon name="sym_o_redo"
      /></q-btn>
      <q-separator vertical class="draw-separator" />

      <q-btn rounded class="app-button btn--no-hover" @click="ds.deleteDraw"
        ><q-icon name="sym_o_delete"
      /></q-btn>
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
