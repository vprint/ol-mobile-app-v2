import { Interaction } from 'ol/interaction';
import { MapBrowserEvent } from 'ol';
import { FeatureLike } from 'ol/Feature';
import VectorTileLayer from 'ol/layer/VectorTile';
import Event from 'ol/events/Event.js';
import VectorLayer from 'ol/layer/Vector';
import { MouseEvent } from 'src/enums/ui-event.enum';
import { getUid } from 'ol/util';
import { click } from 'ol/events/condition';

export interface IOptions {
  layers?: (VectorTileLayer | VectorLayer)[];
}

export interface IFeatureInformation {
  feature: FeatureLike;
  layer: VectorTileLayer | VectorLayer;
}

/**
 * Triggered when a feature or set of features is selected on a vector layer.
 */
export class VectorSelectionEvent extends Event {
  public featureInformations: IFeatureInformation[];
  private mapBrowserEvent: MapBrowserEvent;

  constructor(
    featureInformations: IFeatureInformation[],
    mapBrowserEvent: MapBrowserEvent
  ) {
    super('select');
    console.log(featureInformations)
    this.featureInformations = featureInformations;
    this.mapBrowserEvent = mapBrowserEvent;
  }
}

/**
 * Handle the selection of features on vector layers.
 */
class VectorFeatureSelect extends Interaction {
  public selectionLayers: (VectorTileLayer | VectorLayer)[];

  constructor(options?: IOptions) {
    super({
      handleEvent: (evt: MapBrowserEvent): boolean => {
        this.manageUIEvent(evt);
        return true;
      },
    });

    this.selectionLayers = options?.layers ?? [];
  }

  private manageUIEvent(evt: MapBrowserEvent): void {
    if (click(evt)) {
      const selectedFeatures = this.getVectorFeatures(evt.pixel);
      this.dispatchEvent(new VectorSelectionEvent(selectedFeatures, evt));
    }
  }

  private getVectorFeatures(pixel: number[]): IFeatureInformation[] {
    const selectedFeatures: IFeatureInformation[] = [];

    this.selectionLayers.forEach((layer) => {
      const features = this.getFeaturesAtPixelAndLayer(pixel, layer);

      features?.forEach((feature) => {
        selectedFeatures.push({
          feature,
          layer: layer,
        });
      });
    });

    return selectedFeatures;
  }

  private getFeaturesAtPixelAndLayer(
    pixel: number[],
    layer: VectorTileLayer | VectorLayer
  ): FeatureLike[] | undefined {
    return this.getMap()?.getFeaturesAtPixel(pixel, {
      layerFilter: (candidateLayer) => getUid(candidateLayer) === getUid(layer),
      hitTolerance: 10,
    });
  }

  /**
   * Removes the layer from the selection layers.
   * @param layer - The layer to remove from selection layers.
   */
  public removeLayer(layer: VectorTileLayer | VectorLayer): void {
    const index = this.selectionLayers.findIndex(
      (existingLayer) => getUid(existingLayer) === getUid(layer)
    );

    if (index > -1) {
      this.selectionLayers.splice(index, 1);
    }
  }

  /**
   * Add layer to the selection layers.
   * @param layer - Add the layer to the selection layers.
   */
  public addLayer(layer: VectorTileLayer | VectorLayer): void {
    if (
      !this.selectionLayers.some(
        (currentLayer) => getUid(currentLayer) === getUid(layer)
      )
    ) {
      this.selectionLayers.push(layer);
    }
  }
}

export default VectorFeatureSelect;
