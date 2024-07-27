import { Map } from 'ol';
import {
  IBackgroundLayer,
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
        name: layer.name,
        id: layer.layerId,
        baseLayer: true,
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
        url: `${APP_PARAMS.vectorTileServer}/${layer.name}/{z}/{x}/{y}.pbf`,
        attributions: layer.attribution,
      }),
      zIndex: layer.zIndex,
      properties: {
        name: layer.name,
        layerId: layer.layerId,
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
 * Add the measure layer to the map
 * @param map Openlayers map
 */
function addMeasureLayer(map: Map): void {
  const measureLayer = new VectorLayer({
    source: new VectorSource(),
    properties: {
      name: MEASURE_LAYER.name,
      id: MEASURE_LAYER.layerId,
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
}: IImportLayer): void {
  addBackgroundLayers(map, backgroundLayers);
  addVectorTileLayers(map, vectorTileLayers);
  addMeasureLayer(map);
}
