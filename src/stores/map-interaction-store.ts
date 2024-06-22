// Map import

// Vue/Quasar imports

// Store imports
import { defineStore, storeToRefs } from 'pinia';
import { useMapStore } from './map-store';
import { ref } from 'vue';
import { VectorTileSelect } from 'src/utils/VectorTileSelect';

// Others imports

// Interface imports

/**
 * Store and manage mapInteraction. Exemple : enable or disable the click interaction that allow to select site
 */
export const useMapInteractionStore = defineStore('mapInteraction', () => {
  const isMapInteractionsInitialized = ref(false);
  const selector = ref(new VectorTileSelect());
  const { map } = storeToRefs(useMapStore());

  function initializeInteractions(): void {
    map.value.addInteraction(selector.value as VectorTileSelect);
    isMapInteractionsInitialized.value = true;
  }

  return {
    isMapInteractionsInitialized,
    selector,
    initializeInteractions,
  };
});
