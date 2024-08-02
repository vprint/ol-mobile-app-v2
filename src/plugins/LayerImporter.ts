import { Map } from 'ol';
import {
  IBackgroundLayer,
  IRasterLayer,
  IVectorTileLayer,
  MEASURE_LAYER,
} from '../utils/params/layersParams';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import LayerGroup from 'ol/layer/Group';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import MVT from 'ol/format/MVT';
import { APP_PARAMS } from '../utils/params/appParams';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { ILayerProperties } from 'src/interface/ILayerParameters';
import ImageLayer from 'ol/layer/Image';
import { ImageWMS } from 'ol/source';

/**
 * interface for importLayer() function
 */
interface IImportLayer {
  /**
   * Target map where the layers shoud be imported
   */
  map: Map;
  /**
   * Array of background layers to import
   */
  backgroundLayers: IBackgroundLayer[];
  /**
   * Array of vector tile layers to import
   */
  vectorTileLayers: IVectorTileLayer[];
  /**
   * Array of raster to import
   */
  rasterLayers: IRasterLayer[];
}

/**
 * Add background layers to the map
 * @param map OpenLayers map
 */
function addBackgroundLayers(map: Map, layerList: IBackgroundLayer[]): void {
  const backgroundLayers: TileLayer<XYZ>[] = layerList.map((layer) => {
    return new TileLayer({
      source: new XYZ({
        url: layer.token
          ? `${layer.url}access-token=${layer.token}`
          : `${layer.url}`,
        tilePixelRatio: 2,
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
  });

  map.addLayer(
    new LayerGroup({
      layers: backgroundLayers,
      properties: {
        title: 'Background',
      },
    })
  );
}

/**
 * Add vector tile layers to the map
 * @param map OpenLayers map
 */
function addVectorTileLayers(map: Map, layerList: IVectorTileLayer[]): void {
  const vectorTileLayers: VectorTileLayer[] = layerList.map((layer) => {
    return new VectorTileLayer({
      source: new VectorTileSource({
        format: new MVT({
          idProperty: layer.featureId,
        }),
        url: `${APP_PARAMS.vectorTileServer}/${layer.layerId}/{z}/{x}/{y}.pbf`,
        attributions: layer.attribution,
      }),
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
      preload: Infinity,
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
function addOGCLayer(map: Map, layerList: IRasterLayer[]): void {
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
function addWMSLayers(map: Map, layerList: IRasterLayer[]): void {
  layerList.forEach((layer) => {
    map.addLayer(
      new ImageLayer({
        source: new ImageWMS({
          url: `${APP_PARAMS.qgisServer}/wms?`,
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
 * @param map Openlayers map
 */
function addMeasureLayer(map: Map): void {
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

/**
 * This function add a list of layer to the map.
 * @param parameters importing parameters.
 */
export function importLayer({
  map,
  backgroundLayers,
  vectorTileLayers,
  rasterLayers,
}: IImportLayer): void {
  addBackgroundLayers(map, backgroundLayers);
  addVectorTileLayers(map, vectorTileLayers);
  addOGCLayer(map, rasterLayers);
  addMeasureLayer(map);
}
