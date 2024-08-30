import { ILayerProperties } from 'src/interface/ILayerParameters';
import { Map } from 'ol';
import {
  IBackgroundLayer,
  IRasterLayer,
  IVectorTileLayer,
  MEASURE_LAYER,
} from '../utils/params/layersParams';
import { ImageWMS } from 'ol/source';
import { MapLibreLayer } from '@geoblocks/ol-maplibre-layer';
import ImageTile from 'ol/source/ImageTile.js';
import TileLayer from 'ol/layer/WebGLTile.js';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import MVT from 'ol/format/MVT';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import ImageLayer from 'ol/layer/Image';
import LayerGroup from 'ol/layer/Group';

/**
 * Add raster background layers to the map
 * @param map OpenLayers map
 * @layerList List of layers to add
 */
export function addRasterBackgroundLayers(
  map: Map,
  layerList: IBackgroundLayer[]
): void {
  const rasterBackgroundLayers = layerList.filter((layer) => !layer.vector);

  rasterBackgroundLayers.forEach((layer) => {
    const xyzLayer = new TileLayer({
      source: new ImageTile({
        url: layer.token
          ? `${layer.url}?access-token=${layer.token}`
          : `${layer.url}`,
        attributions: layer.attribution,
      }),
      zIndex: layer.zIndex,
      properties: {
        layerProperties: {
          id: layer.layerId,
          title: layer.name,
          tunable: false,
        } as ILayerProperties,
      },
      visible: layer.visible,
    });

    map.addLayer(xyzLayer);
  });
}

/**
 * Add the vector background layer
 * @param mapLibreLayer Maplibre layer
 * @param layerList List of layer
 */
export function addVectorBackgroundLayers(
  mapLibreLayer: MapLibreLayer,
  layerList: IBackgroundLayer[]
): void {
  const visibleLayer = layerList.find((layer) => layer.visible && layer.vector);

  if (visibleLayer) {
    mapLibreLayer.mapLibreMap?.setStyle(
      `${visibleLayer.url}?access-token=${visibleLayer.token}`
    );
  }
}

/**
 * Add vector tile layers to the map
 * @param map OpenLayers map
 */
export function addVectorTileLayers(
  map: Map,
  layerList: IVectorTileLayer[]
): void {
  const vectorTileLayers: VectorTileLayer[] = layerList.map((layer) => {
    return new VectorTileLayer({
      source: new VectorTileSource({
        format: new MVT({
          idProperty: layer.featureId,
        }),
        url: layer.url,
        attributions: layer.attribution,
      }),

      style: layer.style,
      zIndex: layer.zIndex,
      properties: {
        layerProperties: {
          id: layer.layerId,
          title: layer.name,
          editable: layer.editable,
          selectionnable: layer.selectionnable,
          tunable: true,
        } as ILayerProperties,
        featureId: layer.featureId,
      },
      visible: layer.visible,
    });
  });

  map.addLayer(
    new LayerGroup({
      layers: vectorTileLayers,
      properties: {
        title: 'Data',
      },
    })
  );
}

/**
 * Add an array of WMTS / WMS layers to the map
 * @param map
 * @param layerList
 */
export function addOGCLayer(map: Map, layerList: IRasterLayer[]): void {
  const wmsLayers = layerList.filter((layer) => layer.mode === 'wms');
  addWMSLayers(map, wmsLayers);

  // const wmtsLayers = layerList.filter((layer) => layer.mode === 'wmts');
  // addWMTSLayers(map, wmtsLayers);
}

/**
 * Add an array of WMS layer to the map
 * @param map OpenLayers map
 * @param layerList WMS layer list
 */
export function addWMSLayers(map: Map, layerList: IRasterLayer[]): void {
  layerList.forEach((layer) => {
    map.addLayer(
      new ImageLayer({
        source: new ImageWMS({
          url: layer.url,
          params: { LAYERS: `${layer.layerId}` },
          attributions: layer.attribution,
        }),

        properties: {
          layerProperties: {
            id: `${layer.layerId}_wms`,
            title: layer.name,
            editable: layer.editable,
            description: layer.description,
            dynamic: layer.dynamic,
            tunable: true,
          } as ILayerProperties,
        },

        zIndex: layer.zIndex,
        visible: layer.visible,
      })
    );
  });
}

/**
 * Add an array of wmts to the map
 * @param map OpenLayers map
 * @param layerList WMTS layer list
 */
/*
function addWMTSLayers(map: Map, layerList: IRasterLayer[]): void {
  layerList.forEach((layer) => {
    map.addLayer(
      new TileLayer({
        source: new WMTS({
          attributions: layer.attribution,
          url: `${APP_PARAMS.mapProxyServer}/service`,
          layer: 'svf',
          matrixSet: 'webmercator',
          format: 'image/png',
          projection: this.projection as ProjectionLike,
          tileGrid: new WMTSTileGrid({
            origin: getTopLeft(this.projectionExtent!),
            resolutions: this.resolutions,
            matrixIds: this.matrixIds,
          }),
          style: 'default',
          tilePixelRatio: 2,
        }),
        properties: {
          name: `${layer.layerId}_wmts`,
          title: layer.name,
          description: layer.description,
          editable: layer.editable,
          dynamic: layer.dynamic,
        },
        zIndex: layer.zIndex,
        visible: layer.visible,
      })
    );
  });
}
*/

/**
 * Add the measure layer to the map
 * TODO: Déplacer cette fonction ailleurs, elle n'a pas sa place ici
 * @param map Openlayers map
 */
export function addMeasureLayer(map: Map): void {
  const measureLayer = new VectorLayer({
    source: new VectorSource(),
    properties: {
      layerProperties: {
        id: MEASURE_LAYER.layerId,
        title: MEASURE_LAYER.name,
        tunable: false,
      } as ILayerProperties,
    },
    visible: MEASURE_LAYER.visible,
    zIndex: MEASURE_LAYER.zIndex,
  });

  map.addLayer(measureLayer);
}
