// Map import

// Vue/Quasar imports
import { defineStore } from 'pinia';
import { ref, Ref, watch } from 'vue';

// Store imports
import { useMapInteractionStore } from './map-interaction-store';

// Others imports

// Interface imports
import Measure, {
  IMeasureType,
  MeasureEventType,
} from 'src/plugins/measure/Measure';

// Enum imports
import { INTERACTIONS_PARAMS } from 'src/utils/params/interactionsParams';

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
  function addMeasure(mode: IMeasureType): void {
    mis.measurePlugin?.setActive(true);
    mis.measurePlugin?.addMeasureFeature(mode);
    mis.enableInteraction(INTERACTIONS_PARAMS.selector, false);
  }

  /**
   * Remove measure and activate selector
   */
  function removeMeasure(): void {
    mis.measurePlugin?.deactivateMeasure();
    mis.enableInteraction(INTERACTIONS_PARAMS.selector, true);
  }

  /**
   * Remove all measures and associated overlays
   */
  function removeAllMeasure(): void {
    mis.measurePlugin?.clearMeasureFeatures();
    mis.enableInteraction(INTERACTIONS_PARAMS.selector, true);
  }

  /**
   * Manage measure end event and remove listeners
   */
  watch(
    () => mis.measurePlugin,
    (newMeasurePlugin) => {
      if (newMeasurePlugin instanceof Measure) {
        // @ts-expect-error - Type problems due to typescript / ol
        mis.measurePlugin.on(MeasureEventType.MEASURE_END, () => {
          mis.enableInteraction(INTERACTIONS_PARAMS.selector, true);
        });
      }
    }
  );

  return {
    addMeasure,
    removeMeasure,
    removeAllMeasure,
    formatedMeasure,
    measureMenu,
  };
});
