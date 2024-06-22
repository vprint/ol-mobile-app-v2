import { Interaction } from 'ol/interaction';
import { MapBrowserEvent } from 'ol';
import { FeatureLike } from 'ol/Feature';
import VectorTileLayer from 'ol/layer/VectorTile';
import BaseEvent from 'ol/events/Event';

/**
 * Vector tile selection event
 */
export class VectorTileSelectEvent extends BaseEvent {
  private selected: FeatureLike[] | undefined;
  private mapBrowserEvent: MapBrowserEvent<UIEvent>;

  constructor(
    selected: FeatureLike[] | undefined,
    mapBrowserEvent: MapBrowserEvent<UIEvent>
  ) {
    super('select:vectortile');
    this.selected = selected;
    this.mapBrowserEvent = mapBrowserEvent;
  }
}

/**
 * Vector Tile selector class.
 */
export class VectorTileSelect extends Interaction {
  constructor() {
    super({
      handleEvent: (evt: MapBrowserEvent<UIEvent>): boolean => {
        return this.selectFeaturesAtPixel(evt);
      },
    });
  }

  /**
   * Select vector features at a given pixel and fires
   * a vector tile select event on selection (select:vectortile)
   * @param e - Map browser event
   * @returns true when the selection is made
   */
  private selectFeaturesAtPixel(e: MapBrowserEvent<UIEvent>): boolean {
    if (e.type === 'click') {
      const features = this.getMap()?.getFeaturesAtPixel(e.pixel, {
        layerFilter: (layer) => layer instanceof VectorTileLayer,
      });

      this.dispatchEvent(new VectorTileSelectEvent(features, e));
    }
    return true;
  }
}
