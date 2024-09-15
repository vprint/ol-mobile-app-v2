import { Interaction } from 'ol/interaction';
import { MapBrowserEvent } from 'ol';
import { FeatureLike } from 'ol/Feature';
import VectorTileLayer from 'ol/layer/VectorTile';
import Event from 'ol/events/Event.js';
import { Fill, Stroke, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { getUid } from 'ol/util.js';

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
  public selectedFeatures = new Set<string>();
  private selectableLayer: VectorTileLayer;
  private isInitialized = false;
  private selectionStyle: Style;
  private selectionLayer: VectorTileLayer;

  constructor(
    name: string,
    selectableLayer: VectorTileLayer,
    selectionStyle?: Style
  ) {
    super({
      handleEvent: (evt: MapBrowserEvent<UIEvent>): boolean =>
        this.selectFeaturesAtPixel(evt),
    });
    this.set('name', name);
    this.selectableLayer = selectableLayer;
    this.selectionStyle =
      selectionStyle ??
      new Style({
        image: new CircleStyle({
          radius: 10,
          fill: new Fill({ color: '#3399CC' }),
          stroke: new Stroke({ color: '#fff', width: 2 }),
        }),
      });

    this.selectionLayer = new VectorTileLayer({
      renderMode: 'vector',
      zIndex: 999,
      source: this.selectableLayer.getSource() ?? undefined,
      style: (feature: FeatureLike): Style | undefined => {
        const featureId = feature.getId()?.toString();
        if (featureId && this.selectedFeatures.has(featureId)) {
          return this.selectionStyle;
        }
        return undefined;
      },
    });
  }

  /**
   * Select vector features at a given pixel and fires
   * a vector tile select event on selection (select:vectortile).
   * @param e - Map browser event
   * @returns false to stop event propagation if selection is made, true otherwise
   */
  private selectFeaturesAtPixel(e: MapBrowserEvent<UIEvent>): boolean {
    this.initialize();
    if (e.type === 'click') {
      const features = this.getMap()?.getFeaturesAtPixel(e.pixel, {
        layerFilter: (layer) => getUid(layer) === getUid(this.selectableLayer),
        hitTolerance: 10,
      });

      const featureIds = features?.map((feature) =>
        feature.getId()?.toString()
      );
      this.setFeaturesById(featureIds);

      this.dispatchEvent(
        new VectorTileSelectEvent(
          VectorTileSelectEventType.VECTOR_TILE_SELECT,
          features,
          e
        )
      );
      return false;
    }
    return true;
  }

  /**
   * Clear selected features.
   */
  public clearFeatures(): void {
    this.selectedFeatures.clear();
    this.selectionLayer.changed();
  }

  /**
   * Show the given feature as selected
   * @param featuresId a list of ids
   */
  public setFeaturesById(featuresId: (string | undefined)[] | undefined): void {
    this.clearFeatures();
    featuresId?.forEach((featureId) => {
      if (featureId) this.selectedFeatures.add(featureId);
    });
    this.selectionLayer.changed();
  }

  /**
   * Initialize component
   */
  private initialize(): void {
    if (!this.isInitialized) {
      this.getMap()?.addLayer(this.selectionLayer);
      this.isInitialized = true;
    }
  }
}

export default VectorTileSelect;
