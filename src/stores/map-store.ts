// Map imports
import Map from 'ol/Map';

// Vue/Quasar imports
import { ref } from 'vue';
import { defineStore } from 'pinia';
import Layer from 'ol/layer/Layer';

// Store imports

// Others imports

/**
 * Store map and provide related functionnalities
 */
export const useMapStore = defineStore('map', () => {
  const map = ref(new Map());
  const isMapInitialized = ref(false);

  /**
   * Set the store map
   * @param map OpenLayers map
   */
  function setMap(newMap: Map): void {
    map.value = newMap;
    isMapInitialized.value = true;
  }

  /**
   * get layer by it's name
   * @param name : layer name
   */
  function getLayerByName(name: string): Layer | undefined {
    return map.value.getAllLayers().find((layer) => layer.get('name') === name);
  }

  /**
   * Remove overlay of a given type
   * @param type overlay type
   */
  function removeOverlaysByType(type: string): void {
    const overlays = map.value.getOverlays().getArray();

    const measureOverlays = overlays.filter(
      (overlay) => overlay.get('type') === type
    );

    measureOverlays.forEach((overlay) => {
      map.value.removeOverlay(overlay);
    });
  }

  return {
    map,
    isMapInitialized,
    setMap,
    getLayerByName,
    removeOverlaysByType,
  };
});
