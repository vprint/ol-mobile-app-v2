// Map imports

// Vue/Quasar imports
import { ref } from 'vue';

// Store imports
import { defineStore } from 'pinia';
import { useMapStore } from './map-store';

// Interface, type and enum imports

// Others imports
import Drawer from 'src/plugins/drawer';
// script

export const useDrawStore = defineStore('draw', () => {
  const isActive = ref(false);

  const drawTest = new Drawer('test', {
    strokeColor: 'rgba(232,32,192,1)',
    fillColor: 'rgba(232,32,192,0.2)',
  });

  function createNewPolygon(): void {
    useMapStore().map.addInteraction(drawTest);
    drawTest.addDrawFeature('Polygon');
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
