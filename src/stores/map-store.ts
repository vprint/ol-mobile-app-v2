// Map imports
import Map from 'ol/Map';
import Layer from 'ol/layer/Layer';

// Vue/Quasar imports
import { ref } from 'vue';
import { defineStore } from 'pinia';

// Store imports

// Others imports
import { LAYER_PROPERTIES } from 'src/utils/params/layersParams';
import { ILayerProperties } from 'src/interface/ILayerParameters';
import { easeOut } from 'ol/easing';
import { Feature } from 'ol';

/**
 * This store manage map and provide related functionnalities.
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
   * Get a layer by it's id
   * @param id : layer id
   */
  function getLayerById(id: string): Layer | undefined {
    return map.value.getAllLayers().find((layer) => {
      const layerProperties = layer.get(LAYER_PROPERTIES) as
        | ILayerProperties
        | undefined;
      return layerProperties?.id === id;
    });
  }

  /**
   * Fit the map to a given extent and execute a callback if necessary
   * @param extent
   * @param callback
   */
  function fitMapToFeature(feature: Feature, callback?: () => void): void {
    const extent = feature.getGeometry()?.getExtent();
    const zoom = map.value.getView().getZoom();

    if (extent && zoom) {
      map.value.getView().fit(extent, {
        maxZoom: zoom < 15 ? 15 : zoom,
        duration: 500,
        padding: [0, 400, 0, 0],
        easing: easeOut,
        callback: callback ? callback : undefined,
      });
    }
  }

  return {
    map,
    isMapInitialized,
    setMap,
    getLayerById,
    fitMapToFeature,
  };
});
