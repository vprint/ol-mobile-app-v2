// Map import

// Vue/Quasar imports
import { defineStore, storeToRefs } from 'pinia';
import { ref, Ref } from 'vue';

// Store imports
import { useMapInteractionStore } from './map-interaction-store';
import { useMapStore } from './map-store';

// Others imports

// Interface imports
import { IMeasureType, MeasureEventType } from 'src/plugins/MeasurePlugin';

// Enum imports
import { INTERACTIONS_PARAMS } from 'src/utils/params/interactionsParams';
import { MEASURE_LAYER } from 'src/utils/params/layersParams';
import VectorLayer from 'ol/layer/Vector';

//script

/**
 * Measure store manager
 */
export const useMeasureStore = defineStore('measureStore', () => {
  const { enableInteraction } = useMapInteractionStore();
  const { getLayerByName, removeOverlaysByType } = useMapStore();
  const { measurePlugin } = storeToRefs(useMapInteractionStore());
  const formatedMeasure: Ref<string> = ref('');
  const measureMenu = ref(false);

  /**
   * Activate measure
   * @param mode Measure mode - can be either Polygon or LineString
   */
  function addMeasure(mode: IMeasureType): void {
    measurePlugin.value.setActive(true);
    measurePlugin.value.addMeasure(mode);
    enableInteraction(INTERACTIONS_PARAMS.selector, false);
  }

  /**
   * Remove measure and activate selector
   */
  function removeMeasure(): void {
    measurePlugin.value.removeMeasure();
    enableInteraction(INTERACTIONS_PARAMS.selector, true);
  }

  /**
   * Remove all measures and associated overlays
   */
  function removeAllMeasure(): void {
    measurePlugin.value.removeMeasure();

    const measureLayer = getLayerByName(MEASURE_LAYER.name) as VectorLayer;
    measureLayer.getSource()?.clear();

    removeOverlaysByType('measure');

    enableInteraction(INTERACTIONS_PARAMS.selector, true);
  }

  /**
   * Manage measure end event and remove listeners
   */
  measurePlugin.value.on(
    // @ts-expect-error - Type problems due to typescript / ol
    MeasureEventType.MEASURE_END,
    () => {
      enableInteraction(INTERACTIONS_PARAMS.selector, true);
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
