// Map import
import { Map, MapBrowserEvent } from 'ol';
import { FeatureLike } from 'ol/Feature';
import VectorTileLayer from 'ol/layer/VectorTile';
import { Pixel } from 'ol/pixel';

// Store import
import { useMapStore } from 'src/stores/map-store';

// Other import

/**
 * This plugins allows to select feature
 */
export default class SelectorPlugin {
  private map: Map;
  private layerName = 'sites';
  public isActive = true;
  public selectedFeature: FeatureLike | undefined;

  constructor(map: Map, layerName: string) {
    this.map = map;
    this.layerName = layerName;
    this.setActive(true);
  }

  /**
   * Get vector tile feature at a given pixel
   * @param pixel
   * @param vectorTileLayer
   * @returns Selected Feature
   */
  private async getVectorTileFeatureAtPixel(
    pixel: Pixel,
    vectorTileLayer: VectorTileLayer<FeatureLike>
  ): Promise<FeatureLike | undefined> {
    const features = await vectorTileLayer.getFeatures(pixel);

    if (features.length > 0) {
      return features[0];
    }

    return undefined;
  }

  /**
   * Select feature at a given pixel for a give layer
   * @param e UI Event (exemple: click)
   */
  private async selectFeatureAtLayer(
    e: MapBrowserEvent<UIEvent>
  ): Promise<void> {
    const listenedLayer = useMapStore().getLayerByName(
      this.layerName
    ) as VectorTileLayer<FeatureLike>;
    const feature = await this.getVectorTileFeatureAtPixel(
      e.pixel,
      listenedLayer
    );

    this.selectedFeature = feature;
    console.log(feature);
  }

  /**
   * Activate / deactivate selector plugin
   * @param active Activate / deactivate
   */
  public setActive(active: boolean): void {
    this.isActive = active;
    if (active) {
      this.map.on('click', (e) => {
        this.selectFeatureAtLayer(e);
      });
    } else {
      this.map.un('click', this.selectFeatureAtLayer);
    }
  }

  /**
   * Define the selection layer
   * @param layerName Layer name
   */
  public setSelectionLayer(layerName: string | undefined): void {
    this.layerName = layerName ?? this.layerName;
  }
}
