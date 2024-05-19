// Map imports
import Map from 'ol/Map';

// Vue/Quasar imports
import { ref } from 'vue';
import { defineStore } from 'pinia';

// Store imports

// Others imports

export const useMapStore = defineStore('map', () => {
  const map = ref(new Map());
  const isInitialized = ref(false);

  /**
   * Set the store map
   * @param map OpenLayers map
   */
  function setMap(newMap: Map): void {
    map.value = newMap;
    isInitialized.value = true;
  }

  return { map, isInitialized, setMap };
});
