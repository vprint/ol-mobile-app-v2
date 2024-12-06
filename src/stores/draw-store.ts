// Map imports

// Vue/Quasar imports
import { ref } from 'vue';

// Store imports
import { defineStore } from 'pinia';

// Interface, type and enum imports

// Others imports

// script

export const useDrawStore = defineStore('draw', () => {
  const isActive = ref(false);

  function createNewPolygon(): void {
    console.log('create new poly');
  }

  function createNewLine(): void {
    console.log('create new line');
  }

  function createNewPoint(): void {
    console.log('create new point');
  }

  function undoModification(): void {
    console.log('undo');
  }

  function RedoModification(): void {
    console.log('redo');
  }

  function deleteDraw(): void {
    console.log('delete');
  }
  return {
    isActive,
    createNewPolygon,
    createNewLine,
    createNewPoint,
    undoModification,
    RedoModification,
    deleteDraw,
  };
});
