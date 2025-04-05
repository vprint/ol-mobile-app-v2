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
  LayerIdentifier,
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
import { Extent } from 'ol/extent';

/**
 * This store provide the application map and functionnalities related to the map
 */
export const useMapStore = defineStore('mapStore', () => {
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
  function getLayerById<TypeOfLayer extends Layer>(
    id: LayerIdentifier
  ): TypeOfLayer | undefined {
    return map.getAllLayers().find((layer) => {
      const properties = layer.get(LAYER_PROPERTIES_FIELD);
      return properties?.id === id;
    }) as TypeOfLayer;
  }

  /**
   * Get the underlying MapLibre instance
   * @returns - The MapLibre instance
   */
  function getMapLibreInstance(): MapLibreLayer | undefined {
    return map.getAllLayers().find((layer) => {
      return layer.get(LAYER_PROPERTIES_FIELD)?.id === 'maplibre-layer';
    }) as MapLibreLayer | undefined;
  }

  function _createMapLibreInstance(): MapLibreLayer {
    const mapLibreLayer = new MapLibreLayer({
      mapLibreOptions: {},
      zIndex: 0,
      properties: {
        layerProperties: {
          id: 'maplibre-layer',
          title: 'maplibre-layer',
          allowParameterChange: false,
        } as ILayerProperties,
      },
    });
    return mapLibreLayer;
  }

  /**
   * Adjusts the map view by applying padding and optionally zooming to a feature.
   * If no feature is provided, only applies padding to the current extent.
   * @param padding - Padding (in pixels) to be cleared inside the view. Values in the array are top, right, bottom and left padding.
   * @param feature - Optional feature to center and zoom the view on. If not provided, maintains the current map extent.
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

    const extent = _getExtentFromFeature(feature);

    if (extent) {
      _fitMapView(extent, newZoom, padding);
    }
  }

  /**
   * Get layers with a given properties.
   * @param property - The layer properties to inspect.
   * @param value - The value of the properties.
   * @returns - List of layers that match the filter.
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
   * Initialize MapLibre, add layer and then set `isMapInitialized` to true.
   */
  function initializeMap(): void {
    const mapLibreLayer = _createMapLibreInstance();
    map.addLayer(mapLibreLayer);
    _addApplicationLayers(map, mapLibreLayer);
    map.setTarget('map');

    isMapInitialized.value = true;
  }

  /**
   * Add the application layers to the map.
   * @param map - The OpenLayers map.
   * @param mapLibreLayer - The MapLibre layer.
   */
  function _addApplicationLayers(map: Map, mapLibreLayer: MapLibreLayer): void {
    addVectorBackgroundLayers(mapLibreLayer, BACKGROUND_LAYERS_SETTINGS);
    addRasterBackgroundLayers(map, BACKGROUND_LAYERS_SETTINGS);
    addVectorTileLayers(map, VECTOR_TILE_LAYERS_SETTINGS);
    addOGCLayer(map, RASTER_LAYERS_SETTINGS);
  }

  /**
   * Returns the geographical extent of a feature.
   * Current view extent is returned if the feature is undefined.
   * @param feature - Optional feature from which to calculate the extent.
   * @returns - The extent.
   */
  function _getExtentFromFeature(feature?: Feature): Extent | undefined {
    return feature
      ? feature.getGeometry()?.getExtent()
      : map.getView().calculateExtent(map.getSize());
  }

  /**
   * Adjusts the map view to display the given extent with optional zoom level and padding.
   * @param extent - The geographic extent to display.
   * @param newZoom - The zoom level to apply.
   * @param padding - Padding (in pixels) to be cleared inside the view. Values in the array are top, right, bottom and left padding.
   */
  function _fitMapView(
    extent: Extent,
    newZoom?: number,
    padding?: number[]
  ): void {
    map.getView().fit(extent, {
      maxZoom: newZoom,
      padding: padding,
      duration: 250,
      easing: easeOut,
    });
  }

  return {
    map,
    isMapInitialized,
    getMapLibreInstance,
    getLayerById,
    setPaddingAndExtent,
    getLayersByProperties,
    initializeMap,
  };
});
