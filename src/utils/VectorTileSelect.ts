import { Interaction } from 'ol/interaction';
import { MapBrowserEvent } from 'ol';
import { FeatureLike } from 'ol/Feature';
import VectorTileLayer from 'ol/layer/VectorTile';
import Event from 'ol/events/Event.js';

/**
 * Vector tile select event type definition
 */
export enum VectorTileSelectEventType {
  VECTORTILESELECT = 'select:vectortile',
}

/**
 * Vector tile selection event
 */
export class VectorTileSelectEvent extends Event {
  public selected: FeatureLike[] | undefined;
  public mapBrowserEvent: MapBrowserEvent<UIEvent>;

  constructor(
    type: VectorTileSelectEventType,
    selected: FeatureLike[] | undefined,
    mapBrowserEvent: MapBrowserEvent<UIEvent>
  ) {
    super(type);
    this.selected = selected;
    this.mapBrowserEvent = mapBrowserEvent;
  }
}

/**
 * Vector Tile selector class.
 * The class select features for every visible vector tile layer on the map
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
        layerFilter: (layer) =>
          layer instanceof VectorTileLayer && layer.getVisible(),
      });

      this.dispatchEvent(
        new VectorTileSelectEvent(
          VectorTileSelectEventType.VECTORTILESELECT,
          features,
          e
        )
      );
    }
    return true;
  }
}
