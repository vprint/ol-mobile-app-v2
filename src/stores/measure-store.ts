// Map import

// Vue/Quasar imports
import { defineStore } from 'pinia';
import { onMounted, ref, Ref } from 'vue';

// Store imports
import { useMapInteractionStore } from './map-interaction-store';

// Others imports

// Interface imports
import { MeasureEventType } from 'src/services/measure/Measure';

// Enum imports
import { Interactions } from 'src/enums/interactions.enum';
import { GeometryType } from 'src/enums/map.enum';

//script

/**
 * This store provide measure management tools (e.g remove measure, add measure)
 */
export const useMeasureStore = defineStore('measure', () => {
  const mapInteractionStore = useMapInteractionStore();
  const formatedMeasure: Ref<string> = ref('');
  const measureMenu = ref(false);

  /**
   * Activate measure
   * @param mode - Measure mode - can be either Polygon or LineString
   */
  function addMeasure(
    mode: GeometryType.LINE_STRING | GeometryType.POLYGON
  ): void {
    mapInteractionStore.measurePlugin.setActive(true);
    mapInteractionStore.measurePlugin.createMeasureFeature(mode);
    mapInteractionStore.enableInteraction(Interactions.SELECTOR, false);
  }

  /**
   * Remove the selected measure, or all measure if any is selected.
   */
  function removeMeasure(): void {
    const feature =
      mapInteractionStore.measurePlugin.modifyInteraction.getFeature();

    feature
      ? mapInteractionStore.measurePlugin.removeSelectedMeasure()
      : mapInteractionStore.measurePlugin.removeAllMeasures();

    mapInteractionStore.enableInteraction(Interactions.SELECTOR, true);
  }

  /**
   * Abort the current measure
   */
  function abortCurrentMeasure(): void {
    mapInteractionStore.measurePlugin.abortMeasuring();
  }

  onMounted(() => {
    // @ts-expect-error - Type problems due to typescript / ol
    mapInteractionStore.measurePlugin.on(MeasureEventType.MEASURE_END, () => {
      mapInteractionStore.enableInteraction(Interactions.SELECTOR, true);
    });
  });

  return {
    addMeasure,
    removeMeasure,
    abortCurrentMeasure,
    formatedMeasure,
    measureMenu,
  };
});
