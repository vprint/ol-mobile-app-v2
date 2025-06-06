import { ILayerProperties } from 'src/interface/ILayerParameters';
import {
  IBackgroundLayerParameters,
  IRasterLayerParameters,
  IVectorTileLayerParameters,
} from '../interface/ILayers';
import { LAYER_PROPERTIES_FIELD } from 'src/enums/layers.enum';
import { Map } from 'ol';
import { ImageWMS } from 'ol/source';
import { MapLibreLayer } from '@geoblocks/ol-maplibre-layer';
import ImageTile from 'ol/source/ImageTile.js';
import TileLayer from 'ol/layer/WebGLTile.js';
import VectorTileSource from 'ol/source/VectorTile';
import MVT from 'ol/format/MVT';
import ImageLayer from 'ol/layer/Image';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileInteraction from './VectorTileInteraction';

/**
 * Add raster background layers to the map
 * @param map - OpenLayers map
 * @param layerList - List of layers to add
 */
export function addRasterBackgroundLayers(
  map: Map,
  layerList: IBackgroundLayerParameters[]
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
          id: layer.id,
          title: layer.title,
          allowParameterChange: false,
        } as ILayerProperties,
      },
      visible: layer.visible,
    });

    map.addLayer(xyzLayer);
  });
}

/**
 * Add the vector background layer
 * @param mapLibreLayer - Maplibre layer
 * @param layerList - List of layer
 */
export function addVectorBackgroundLayers(
  mapLibreLayer: MapLibreLayer,
  layerList: IBackgroundLayerParameters[]
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
 * @param map - OpenLayers map
 */
export function addVectorTileLayers(
  map: Map,
  layerList: IVectorTileLayerParameters[]
): void {
  layerList.forEach((layerParams) => {
    const vtLayer = getVectorTileLayer(layerParams);
    map.addLayer(vtLayer);
    if (layerParams.allowSelection)
      map.addInteraction(new VectorTileInteraction(vtLayer));
  });
}

function getVectorTileLayer(
  layer: IVectorTileLayerParameters
): VectorTileLayer {
  return new VectorTileLayer({
    source: getVectorTileSource(layer),
    //style: layer.style,
    zIndex: layer.zIndex,
    properties: {
      [LAYER_PROPERTIES_FIELD]: {
        id: layer.id,
        title: layer.title,
        allowEdition: layer.allowModification,
        allowSelection: layer.allowSelection,
        allowParameterChange: layer.allowParameterChange,
      } as ILayerProperties,
      featureId: layer.featureId,
    },
    visible: layer.visible,
  });
}

function getVectorTileSource(
  layer: IVectorTileLayerParameters
): VectorTileSource {
  return new VectorTileSource({
    format: new MVT({
      idProperty: layer.featureId,
    }),
    url: layer.url,
    attributions: layer.attribution,
  });
}

/**
 * Add an array of WMTS / WMS layers to the map
 * @param map - OpenLayers map.
 * @param layerList - A list of wms/wmts source to add.
 */
export function addOGCLayer(
  map: Map,
  layerList: IRasterLayerParameters[]
): void {
  const wmsLayers = layerList.filter((layer) => layer.mode === 'wms');
  addWMSLayers(map, wmsLayers);

  // const wmtsLayers = layerList.filter((layer) => layer.mode === 'wmts');
  // addWMTSLayers(map, wmtsLayers);
}

/**
 * Add an array of WMS layer to the map
 * @param map - OpenLayers map
 * @param layerList - WMS layer list
 */
export function addWMSLayers(
  map: Map,
  layerList: IRasterLayerParameters[]
): void {
  layerList.forEach((layer) => {
    map.addLayer(
      new ImageLayer({
        source: new ImageWMS({
          url: layer.url,
          params: { LAYERS: `${layer.id}` },
          attributions: layer.attribution,
        }),

        properties: {
          layerProperties: {
            id: `${layer.id}_wms`,
            title: layer.title,
            allowEdition: layer.allowParameterChange,
            description: layer.description,
            isDynamic: layer.isDynamic,
            allowParameterChange: true,
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
 * @param map - OpenLayers map
 * @param layerList - WMTS layer list
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
