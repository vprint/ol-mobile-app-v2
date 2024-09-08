// Map import
import { Interaction } from 'ol/interaction';

// Vue/Quasar imports
import { defineStore, storeToRefs } from 'pinia';
import { Ref, ref } from 'vue';

// Store imports
import { useMapStore } from './map-store';

// Others imports
import VectorTileSelect from 'src/plugins/VectorTileSelect';
import Measure from 'src/plugins/measure/Measure';

// Interface imports
import { INTERACTIONS_PARAMS } from 'src/utils/params/interactionsParams';
import { MEASURE_LAYER } from 'src/utils/params/layersParams';
import VectorLayer from 'ol/layer/Vector';

/**
 * Store and manage mapInteraction.
 * Exemple : enable or disable the click interaction that allow to select site.
 */
export const useMapInteractionStore = defineStore('mapInteraction', () => {
  const isMapInteractionsInitialized = ref(false);
  const { getLayerById } = useMapStore();
  const { map } = storeToRefs(useMapStore());

  const selector: Ref<null | VectorTileSelect> = ref(null);
  const measurePlugin: Ref<null | Measure> = ref(null);

  /**
   * Initialize all interactions
   */
  function initializeInteractions(): void {
    selector.value = new VectorTileSelect(INTERACTIONS_PARAMS.selector);
    map.value.addInteraction(selector.value as VectorTileSelect);

    measurePlugin.value = new Measure(
      INTERACTIONS_PARAMS.measure,
      getLayerById(MEASURE_LAYER.layerId) as VectorLayer
    );
    measurePlugin.value.setActive(false);
    map.value.addInteraction(measurePlugin.value as Measure);

    isMapInteractionsInitialized.value = true;
  }

  /**
   * Activate or deactivate interaction by it's name
   * @param interactionName Interaction name
   * @param active Activate or deactivate the interaction.
   */
  function enableInteraction(
    interactionName: INTERACTIONS_PARAMS,
    active: boolean
  ): void {
    const interaction = getInteractionByName(interactionName);
    interaction?.setActive(active);
  }

  /**
   * Get interaction by name
   * @param name Interaction name
   * @returns Return the interaction or undefined if not found
   */
  function getInteractionByName(name: string): Interaction | undefined {
    let findedElement: Interaction | undefined;

    map.value.getInteractions().forEach((interaction) => {
      if (interaction.get('name') === name) {
        findedElement = interaction;
      }
    });

    return findedElement;
  }

  return {
    isMapInteractionsInitialized,
    selector,
    measurePlugin,
    initializeInteractions,
    enableInteraction,
    getInteractionByName,
  };
});
