import { Map } from 'ol';
import { IBackgroundLayer } from './params/layersParams';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import LayerGroup from 'ol/layer/Group';

interface ILayerImporter {
  map: Map;
  backgroundLayers: IBackgroundLayer[];
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
        id: layer.id,
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

export function LayerImporter({ map, backgroundLayers }: ILayerImporter): void {
  addBackgroundLayers(map, backgroundLayers);
}
