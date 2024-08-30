// Map import

// Vue/Quasar imports
import { defineStore, storeToRefs } from 'pinia';
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
  const { enableInteraction } = useMapInteractionStore();
  const { measurePlugin } = storeToRefs(useMapInteractionStore());
  const formatedMeasure: Ref<string> = ref('');
  const measureMenu = ref(false);

  /**
   * Activate measure
   * @param mode Measure mode - can be either Polygon or LineString
   */
  function addMeasure(mode: IMeasureType): void {
    measurePlugin.value?.setActive(true);
    measurePlugin.value?.addMeasure(mode);
    enableInteraction(INTERACTIONS_PARAMS.selector, false);
  }

  /**
   * Remove measure and activate selector
   */
  function removeMeasure(): void {
    measurePlugin.value?.deactivateMeasure();
    enableInteraction(INTERACTIONS_PARAMS.selector, true);
  }

  /**
   * Remove all measures and associated overlays
   */
  function removeAllMeasure(): void {
    measurePlugin.value?.clearMeasureFeatures();
    enableInteraction(INTERACTIONS_PARAMS.selector, true);
  }

  /**
   * Manage measure end event and remove listeners
   */
  watch(
    () => measurePlugin.value,
    (newMeasurePlugin) => {
      if (newMeasurePlugin instanceof Measure) {
        // @ts-expect-error - Type problems due to typescript / ol
        measurePlugin.value.on(MeasureEventType.MEASURE_END, () => {
          enableInteraction(INTERACTIONS_PARAMS.selector, true);
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
