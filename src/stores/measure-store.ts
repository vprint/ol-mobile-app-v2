// Map import

// Vue/Quasar imports
import { defineStore } from 'pinia';
import { onMounted, ref, Ref } from 'vue';

// Store imports
import { useMapInteractionStore } from './map-interaction-store';

// Others imports

// Interface imports
import { MeasureEventType } from 'src/plugins/measure/Measure';

// Enum imports
import { Interactions } from 'src/enums/interactions.enum';
import { GeometryType } from 'src/enums/geometry.enum';

//script

/**
 * This store provide measure management tools (e.g remove measure, add measure)
 */
export const useMeasureStore = defineStore('measure', () => {
  const mis = useMapInteractionStore();
  const formatedMeasure: Ref<string> = ref('');
  const measureMenu = ref(false);

  /**
   * Activate measure
   * @param mode Measure mode - can be either Polygon or LineString
   */
  function addMeasure(
    mode: GeometryType.LINE_STRING | GeometryType.POLYGON
  ): void {
    mis.measurePlugin.setActive(true);
    mis.measurePlugin.addMeasureFeature(mode);
    mis.enableInteraction(Interactions.SELECTOR, false);
  }

  /**
   * Remove measure and activate selector
   */
  function removeMeasure(): void {
    mis.measurePlugin.removeFeature();
    mis.enableInteraction(Interactions.SELECTOR, true);
  }

  /**
   * Remove all measures and associated overlays
   */
  function removeAllMeasure(): void {
    mis.measurePlugin.removeAllFeatures();
    mis.enableInteraction(Interactions.SELECTOR, true);
  }

  /**
   * Abort the current measure
   */
  function abortCurrentMeasure(): void {
    mis.measurePlugin.abortMeasuring();
  }

  onMounted(() => {
    // @ts-expect-error - Type problems due to typescript / ol
    mis.measurePlugin.on(MeasureEventType.MEASURE_END, () => {
      mis.enableInteraction(Interactions.SELECTOR, true);
    });
  });

  return {
    addMeasure,
    removeMeasure,
    removeAllMeasure,
    abortCurrentMeasure,
    formatedMeasure,
    measureMenu,
  };
});
