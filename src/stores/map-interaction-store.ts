// Map import
import { Map } from 'ol';

// Vue/Quasar imports
import { Ref, ref, watch } from 'vue';

// Store imports
import { defineStore, storeToRefs } from 'pinia';
import { useMapStore } from './map-store';
import { useSiteStore } from './site-store';

// Others imports
import MeasurePlugin from 'src/utils/MeasurePlugin';
import SelectorPlugin from 'src/utils/SelectorPlugin';

// Interface imports

/**
 * Store and manage mapInteraction. Exemple : enable or disable the click interaction that allow to select site (see enableClickSelector).
 */
export const useMapInteractionStore = defineStore('mapInteraction', () => {
  const { map, isMapInitialized } = storeToRefs(useMapStore());
  const { setSite } = useSiteStore();
  const measure: Ref<MeasurePlugin | undefined> = ref(undefined);
  const selectorPlugin: Ref<SelectorPlugin | undefined> = ref(undefined);
  const isSelectorActive = ref(true);
  const isMeasureActive = ref(measure.value?.isActive);

  /**
   * Enable or disable click event
   * @param active Activate / deactivate event listener
   * @param layerName Layer name
   */
  function enableClickSelector(active: boolean, layerName?: string): void {
    isSelectorActive.value = active;
    selectorPlugin.value?.setSelectionLayer(layerName ?? undefined);
    selectorPlugin.value?.setActive(active);
  }

  /**
   * Enable / disable measure
   * @param isActive Wether the measure should be activated or deactivated
   */
  function enableMeasure(active: boolean): void {
    isMeasureActive.value = active;
    active ? measure.value?.addMeasure() : measure.value?.removeMeasure();
    enableClickSelector(false);
  }

  watch(
    () => isMapInitialized.value,
    () => {
      if (isMapInitialized.value) {
        measure.value = new MeasurePlugin(map.value as Map);
        selectorPlugin.value = new SelectorPlugin(map.value as Map, '');
      }
    }
  );

  watch(
    () => selectorPlugin.value?.selectedFeature,
    (feature) => {
      if (feature) {
        setSite(feature.getId() as number);
      }
    },
    {
      deep: true,
    }
  );

  return {
    map,
    measure,
    selectorPlugin,
    isSelectorActive,
    isMeasureActive,
    enableClickSelector,
    enableMeasure,
  };
});
