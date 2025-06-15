// Map imports

// Vue/Quasar imports
import { ref } from 'vue';

// Store imports
import { defineStore } from 'pinia';
import { useMapInteractionStore } from './map-interaction-store';
import { useNotificationStore } from './notify-store';

// Interface, type and enum imports

// Others imports
import { GeometryType } from 'src/enums/map.enum';

// script
const mapInteractionStore = useMapInteractionStore();
const notificationStore = useNotificationStore();

export const useDrawStore = defineStore('drawStore', () => {
  const isVisible = ref(false);


  function createNewPolygon(): void {
    mapInteractionStore.drawPlugin.createFeature(GeometryType.POLYGON);
  }

  function createNewLine(): void {
    mapInteractionStore.drawPlugin.createFeature(GeometryType.LINE_STRING);
  }

  function createNewPoint(): void {
    mapInteractionStore.drawPlugin.createFeature(GeometryType.POINT);
  }

  function undoModification(): void {
    console.log('undo');
  }

  function RedoModification(): void {
    notificationStore.pushSuccess('Super !', 'Ca marche !');
    notificationStore.pushWarning('Super !', 'Ca marche !');
    notificationStore.pushError('Super !', 'Ca marche !');
    notificationStore.pushInfo('Super !', 'Ca marche !');
  }

  function deleteDraw(): void {
    console.log('need to implement this');
    //mis.drawPlugin.removeFeature();
  }

  function setVisible(active: boolean): void {
    isVisible.value = active;
  }

  return {
    isVisible,
    createNewPolygon,
    createNewLine,
    createNewPoint,
    undoModification,
    RedoModification,
    deleteDraw,
    setVisible,
  };
});
