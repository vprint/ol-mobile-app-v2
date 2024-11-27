// Map imports
import Map from 'ol/Map';
import Layer from 'ol/layer/Layer';

// Vue/Quasar imports
import { ref } from 'vue';
import { defineStore } from 'pinia';

// Store imports

// Others imports
import {
  BACKGROUND_LAYERS_SETTINGS,
  LAYER_PROPERTIES,
  RASTER_LAYERS_SETTINGS,
  VECTOR_TILE_LAYERS_SETTINGS,
} from 'src/utils/params/layersParams';
import { ILayerProperties } from 'src/interface/ILayerParameters';
import { easeOut } from 'ol/easing';
import { Feature, View } from 'ol';
import { MapLibreLayer } from '@geoblocks/ol-maplibre-layer';
import { fromLonLat } from 'ol/proj';
import {
  addVectorBackgroundLayers,
  addRasterBackgroundLayers,
  addVectorTileLayers,
  addOGCLayer,
} from 'src/plugins/LayerImporter';
import { MAPSETTINGS } from 'src/utils/params/mapParams';

/**
 * This store provide the application map and functionnalities related to the map
 */
export const useMapStore = defineStore('map', () => {
  /**
   * Application map
   */
  const map = new Map({
    controls: [],
    view: new View({
      center: fromLonLat([MAPSETTINGS.long, MAPSETTINGS.lat]),
      zoom: MAPSETTINGS.zoom,
      maxZoom: MAPSETTINGS.maxzoom,
      minZoom: MAPSETTINGS.minzoom,
    }),
  });

  /**
   * Is the map initialized
   */
  const isMapInitialized = ref(false);

  /**
   * Get a layer by it's id
   * @param id : layer id
   */
  function getLayerById(id: string): Layer | undefined {
    return map.getAllLayers().find((layer) => {
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
    const zoom = map.getView().getZoom();

    if (extent && zoom) {
      map.getView().fit(extent, {
        maxZoom: zoom < 15 ? 15 : zoom,
        duration: 500,
        padding: [0, 0, 0, 400],
        easing: easeOut,
        callback: callback ? callback : undefined,
      });
    }
  }

  /**
   * Get layers with a given properties
   * @param property The layer properties to inspect
   * @param value The value of the properties
   * @returns List of layers that match the filter
   */
  function getLayersByProperties<K extends keyof ILayerProperties>(
    property: K,
    value: ILayerProperties[K]
  ): Layer[] {
    const layersOfInterest: Layer[] = [];
    const mapLayers = map.getAllLayers();

    mapLayers.forEach((layer) => {
      const layerProperties = layer.get(LAYER_PROPERTIES) as
        | ILayerProperties
        | undefined;

      if (layerProperties?.[property] === value) {
        layersOfInterest.push(layer);
      }
    });

    return layersOfInterest;
  }

  /**
   * Initialize the map. This function create the layers and set the map target.
   * Set the isMapInitialized to true after that.
   */
  function initializeMap(): void {
    // An empty mapLibre layer is added to the map
    const mapLibreLayer = new MapLibreLayer({
      mapLibreOptions: {},
      zIndex: 0,
      properties: {
        layerProperties: {
          id: 'maplibre-layer',
          title: 'maplibre-layer',
          tunable: false,
        } as ILayerProperties,
      },
    });
    map.addLayer(mapLibreLayer);

    /**
     * Add the application layers.
     */
    addVectorBackgroundLayers(mapLibreLayer, BACKGROUND_LAYERS_SETTINGS);
    addRasterBackgroundLayers(map, BACKGROUND_LAYERS_SETTINGS);
    addVectorTileLayers(map, VECTOR_TILE_LAYERS_SETTINGS);
    addOGCLayer(map, RASTER_LAYERS_SETTINGS);

    map.setTarget('map');
    isMapInitialized.value = true;
  }

  return {
    map,
    isMapInitialized,
    getLayerById,
    fitMapToFeature,
    getLayersByProperties,
    initializeMap,
  };
});
