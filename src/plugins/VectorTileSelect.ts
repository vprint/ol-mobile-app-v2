import { Interaction } from 'ol/interaction';
import { MapBrowserEvent } from 'ol';
import { FeatureLike } from 'ol/Feature';
import VectorTileLayer from 'ol/layer/VectorTile';
import Event from 'ol/events/Event.js';
import { Fill, Stroke, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';

/**
 * Vector tile select event type definition
 */
export enum VectorTileSelectEventType {
  VECTOR_TILE_SELECT = 'select:vectortile',
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
 * The class selects features for a given visible vector tile layer on the map.
 */
class VectorTileSelect extends Interaction {
  public selectedFeatures: Record<string, FeatureLike> = {};
  private styleCache: Record<string, Style> = {};

  private selectableLayer: VectorTileLayer | undefined;
  private isInitialized = false;

  private selectionStyle = (feature: FeatureLike): Style | undefined => {
    const featureId = feature.getId();
    if (featureId && featureId in this.selectedFeatures) {
      if (!(featureId in this.styleCache)) {
        const style = new Style({
          image: new CircleStyle({
            radius: 15,
            fill: new Fill({
              color: '#3399CC',
            }),
            stroke: new Stroke({
              color: '#fff',
              width: 2,
            }),
          }),
        });
        this.styleCache[featureId] = style;
      }
      return this.styleCache[featureId];
    }
    return undefined;
  };

  private selectionLayer = new VectorTileLayer({
    renderMode: 'vector',
    zIndex: 999,
    style: this.selectionStyle,
  });

  constructor(name: string, selectableLayer: VectorTileLayer) {
    super({
      handleEvent: (evt: MapBrowserEvent<UIEvent>): boolean => {
        return this.selectFeaturesAtPixel(evt);
      },
    });
    this.set('name', name);
    this.selectableLayer = selectableLayer;
    this.selectionLayer.setSource(this.selectableLayer.getSource() ?? null);
  }

  /**
   * Select vector features at a given pixel and fires
   * a vector tile select event on selection (select:vectortile).
   * @param e - Map browser event
   * @returns true when the selection is made
   */
  private selectFeaturesAtPixel(e: MapBrowserEvent<UIEvent>): boolean {
    this.initialize();

    if (e.type === 'click') {
      this.clearSelect();

      const features = this.getMap()?.getFeaturesAtPixel(e.pixel, {
        layerFilter: (layer) => {
          //@ts-expect-error access to private properties
          return layer.ol_uid === this.selectableLayer.ol_uid;
        },
        hitTolerance: 10,
      });

      this.dispatchEvent(
        new VectorTileSelectEvent(
          VectorTileSelectEventType.VECTOR_TILE_SELECT,
          features,
          e
        )
      );

      if (features) {
        features.forEach((feature) => {
          const fid = feature.getId();
          if (fid) {
            this.selectedFeatures[fid] = feature;
          }
        });
        this.selectionLayer.changed();
      }
    }
    return true;
  }

  private initialize(): void {
    if (!this.isInitialized) {
      this.getMap()?.addLayer(this.selectionLayer);
      this.isInitialized = true;
    }
  }

  public clearSelect(): void {
    this.selectedFeatures = {};
    this.selectionLayer.changed();
  }
}

export default VectorTileSelect;
