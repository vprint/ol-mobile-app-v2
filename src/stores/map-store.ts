// Map imports
import { MapLibreLayer } from '@geoblocks/ol-maplibre-layer';
import { easeOut } from 'ol/easing';
import { Feature, View } from 'ol';
import { fromLonLat } from 'ol/proj';
import Map from 'ol/Map';
import Layer from 'ol/layer/Layer';

// Vue/Quasar imports
import { ref } from 'vue';
import { defineStore } from 'pinia';

// Store imports

// Others imports
import {
  BACKGROUND_LAYERS_SETTINGS,
  LAYER_PROPERTIES_FIELD,
  RASTER_LAYERS_SETTINGS,
  VECTOR_TILE_LAYERS_SETTINGS,
} from 'src/enums/layers.enum';
import { ILayerProperties } from 'src/interface/ILayerParameters';
import {
  addVectorBackgroundLayers,
  addRasterBackgroundLayers,
  addVectorTileLayers,
  addOGCLayer,
} from 'src/services/LayerImporter';
import { MapSettings } from 'src/enums/map.enum';

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
      center: fromLonLat([MapSettings.LONG, MapSettings.LAT]),
      zoom: MapSettings.ZOOM,
      maxZoom: MapSettings.MAX_ZOOM,
      minZoom: MapSettings.MIN_ZOOM,
    }),
  });

  /**
   * Is the map initialized
   */
  const isMapInitialized = ref(false);

  /**
   * Get a layer by it's id
   * @param id - layer id
   */
  function getLayerById(id: string): Layer | undefined {
    return map.getAllLayers().find((layer) => {
      const layerProperties = layer.get(LAYER_PROPERTIES_FIELD) as
        | ILayerProperties
        | undefined;
      return layerProperties?.id === id;
    });
  }

  /**
   * Adjusts the map view by applying padding and optionally zooming to a feature.
   * If no feature is provided, only applies padding to the current extent.
   * @param padding - The padding to apply to the map
   * @param feature - Optional feature to center and zoom the view on. If not provided, maintains the current map extent
   */
  function setPaddingAndExtent(padding: number[], feature?: Feature): void {
    let newZoom: number | undefined;
    const view = map.getView();

    if (feature) {
      const zoom = view.getZoom();
      if (zoom) {
        newZoom = zoom < 15 ? 15 : view.getZoom();
      }
    }

    const extent = feature
      ? feature.getGeometry()?.getExtent()
      : view.calculateExtent(map.getSize());

    if (extent) {
      view.fit(extent, {
        maxZoom: newZoom,
        padding: padding,
        duration: 250,
        easing: easeOut,
      });
    }
  }

  /**
   * Get layers with a given properties
   * @param property - The layer properties to inspect
   * @param value - The value of the properties
   * @returns - List of layers that match the filter
   */
  function getLayersByProperties<K extends keyof ILayerProperties>(
    property: K,
    value: ILayerProperties[K]
  ): Layer[] {
    const layersOfInterest: Layer[] = [];
    const mapLayers = map.getAllLayers();

    mapLayers.forEach((layer) => {
      const layerProperties = layer.get(LAYER_PROPERTIES_FIELD) as
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
    setPaddingAndExtent,
    getLayersByProperties,
    initializeMap,
  };
});
