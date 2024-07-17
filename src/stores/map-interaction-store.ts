// Map import

// Vue/Quasar imports

// Store imports
import { defineStore, storeToRefs } from 'pinia';
import { useMapStore } from './map-store';
import { ref } from 'vue';
import VectorTileSelect from 'src/plugins/VectorTileSelect';
import MeasurePlugin from 'src/plugins/MeasurePlugin';
import { INTERACTIONS_PARAMS } from 'src/utils/params/interactionsParams';
import { Interaction } from 'ol/interaction';

// Others imports

// Interface imports

/**
 * Store and manage mapInteraction. Exemple : enable or disable the click interaction that allow to select site
 */
export const useMapInteractionStore = defineStore('mapInteraction', () => {
  const isMapInteractionsInitialized = ref(false);
  const selector = ref(new VectorTileSelect(INTERACTIONS_PARAMS.selector));
  const measurePlugin = ref(new MeasurePlugin(INTERACTIONS_PARAMS.measure));
  const { map } = storeToRefs(useMapStore());

  /**
   * Initialize all interactions
   */
  function initializeInteractions(): void {
    map.value.addInteraction(selector.value as VectorTileSelect);

    measurePlugin.value.setActive(false);
    map.value.addInteraction(measurePlugin.value as MeasurePlugin);

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
