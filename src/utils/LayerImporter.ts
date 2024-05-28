import { Map } from 'ol';
import { IBackgroundLayer, IVectorTileLayer } from './params/layersParams';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import LayerGroup from 'ol/layer/Group';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import MVT from 'ol/format/MVT';
import { APP_PARAMS } from './params/appParams';
import { FeatureLike } from 'ol/Feature';

interface ILayerImporter {
  map: Map;
  backgroundLayers: IBackgroundLayer[];
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
  const vectorTileLayers: VectorTileLayer<FeatureLike>[] = layerList.map(
    (layer) => {
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
    }
  );

  map.addLayer(
    new LayerGroup({
      layers: vectorTileLayers,
      properties: {
        title: 'Data',
      },
    })
  );
}

export function LayerImporter({
  map,
  backgroundLayers,
  vectorTileLayers,
}: ILayerImporter): void {
  addBackgroundLayers(map, backgroundLayers);
  addVectorTileLayers(map, vectorTileLayers);
}
