// Map import

// Vue/Quasar imports
import { Ref, ref, watchEffect } from 'vue';

// Store imports
import { defineStore, storeToRefs } from 'pinia';
import { useMapStore } from './map-store';

// Others imports
import MeasurePlugin from 'src/utils/MeasurePlugin';
import SelectorPlugin from 'src/utils/SelectorPlugin';
import { Map } from 'ol';

// Interface imports

/**
 * Store and manage mapInteraction. Exemple : enable or disable the click interaction that allow to select site (see enableClickSelector).
 */
export const useMapInteractionStore = defineStore('mapInteraction', () => {
  const { map } = storeToRefs(useMapStore());
  const measurePlugin: Ref<MeasurePlugin | undefined> = ref(undefined);
  const selectorPlugin: Ref<SelectorPlugin | undefined> = ref(undefined);
  const isSelectorActive = ref(selectorPlugin.value?.isActive);
  const isMeasureActive = ref(measurePlugin.value?.isActive);

  watchEffect(() => {
    const feature = selectorPlugin.value?.selectedFeature;
    if (feature) {
      console.log(feature);
    }
  });

  /**
   * Enable or disable click event
   * @param active Activate / deactivate event listener
   * @param layerName Layer name
   */
  function enableClickSelector(active: boolean, layerName?: string): void {
    isSelectorActive.value = active;
    selectorPlugin.value?.setSelectionLayer(layerName ?? undefined);
    selectorPlugin.value?.setActive(active);
    if (isMeasureActive.value) {
      enableMeasure(false);
    }
  }

  /**
   * Enable / disable measure
   * @param active Wether the measure should be activated or deactivated
   */
  function enableMeasure(active: boolean): void {
    active
      ? measurePlugin.value?.addMeasure()
      : measurePlugin.value?.removeMeasure();
    if (isSelectorActive.value) {
      enableClickSelector(false);
    }
  }

  /**
   * Set the selection plugin
   * @param sp Selector plugin
   */
  function initSelectorPlugin(map: Map, layerName: string): void {
    selectorPlugin.value = new SelectorPlugin(map, layerName);
  }

  /**
   * Set the measure plugin
   * @param mp Measure plugin
   */
  function setMeasurePlugin(mp: MeasurePlugin): void {
    measurePlugin.value = mp;
  }

  return {
    map,
    measurePlugin,
    selectorPlugin,
    isSelectorActive,
    isMeasureActive,
    initSelectorPlugin,
    setMeasurePlugin,
    enableClickSelector,
    enableMeasure,
  };
});
