// Map import

// Vue/Quasar imports
import { defineStore, storeToRefs } from 'pinia';

// Store imports
import { useMapInteractionStore } from './map-interaction-store';

// Others imports

// Interface imports
import { IMeasureType } from 'src/plugins/MeasurePlugin';

// Enum imports
import { INTERACTIONS_PARAMS } from 'src/utils/params/interactionsParams';

//script

/**
 * Measure store manager
 */
export const useMeasureStore = defineStore('measureStore', () => {
  const { enableInteraction } = useMapInteractionStore();
  const { measurePlugin } = storeToRefs(useMapInteractionStore());

  /**
   * Manaage measure activation / deactivation
   */
  function manageMeasure(mode: IMeasureType): void {
    measurePlugin.value.setActive(true);
    measurePlugin.value.addMeasure(mode);
    enableInteraction(INTERACTIONS_PARAMS.selector, false);
  }

  return {
    manageMeasure,
  };
});
