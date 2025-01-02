// Map imports

// Vue/Quasar imports
import { onMounted, ref } from 'vue';

// Store imports
import { defineStore } from 'pinia';
import { useMapInteractionStore } from './map-interaction-store';
import { useNotificationStore } from './notify-store';

// Interface, type and enum imports

// Others imports
import { GeometryType } from 'src/enums/geometry.enum';
import { MeasureEventType } from 'src/services/measure/Measure';
import { Interactions } from 'src/enums/interactions.enum';

// script
const mis = useMapInteractionStore();
const ns = useNotificationStore();

export const useDrawStore = defineStore('draw', () => {
  const isVisible = ref(false);

  function createNewPolygon(): void {
    mis.drawPlugin.addFeature(GeometryType.POLYGON);
    mis.enableInteraction(Interactions.SELECTOR, false);
  }

  function createNewLine(): void {
    mis.drawPlugin.addFeature(GeometryType.LINE_STRING);
    mis.enableInteraction(Interactions.SELECTOR, false);
  }

  function createNewPoint(): void {
    mis.drawPlugin.addFeature(GeometryType.POINT);
    mis.enableInteraction(Interactions.SELECTOR, false);
  }

  function undoModification(): void {
    console.log('undo');
  }

  function RedoModification(): void {
    ns.pushSuccess('Super !', 'Ca marche !');
    ns.pushWarning('Super !', 'Ca marche !');
    ns.pushError('Super !', 'Ca marche !');
    ns.pushInfo('Super !', 'Ca marche !');
  }

  function deleteDraw(): void {
    mis.drawPlugin.getDrawModifier()?.removeFeature();
  }

  function setVisible(active: boolean): void {
    isVisible.value = active;
  }

  onMounted(() => {
    mis.measurePlugin.on(
      // @ts-expect-error - Type problems due to typescript / ol
      MeasureEventType.MEASURE_END,
      mis.enableInteraction(Interactions.SELECTOR, true)
    );
  });

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
