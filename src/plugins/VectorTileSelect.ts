import { Interaction } from 'ol/interaction';
import { Map, MapBrowserEvent } from 'ol';
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
 * This class provides selection functionality for a
 * given vector tile layer. It is possible to interact
 * with selection by using clearFeatures() and setFeaturesById()
 *
 * @extends Interaction
 */
class VectorTileSelect extends Interaction {
  public selectedFeatures = new Set<string>();
  private selectableLayer: VectorTileLayer | undefined;
  private selectionStyle: Style;
  private selectionLayer: VectorTileLayer;

  constructor({
    name,
    selectionStyle,
    selectableLayer,
  }: {
    name: string;
    selectionStyle?: Style;
    selectableLayer?: VectorTileLayer;
  }) {
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
      source: this.selectableLayer?.getSource() ?? undefined,
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
   * Initialize the component
   * @param map OpenLayers map
   */
  public setMap(map: Map | null): void {
    super.setMap(map);
    this.getMap()?.addLayer(this.selectionLayer);
  }

  /**
   * Set the selection layer
   * @param layer The layer where the feature should be selected
   */
  public setSelectableLayer(layer: VectorTileLayer): void {
    this.selectableLayer = layer;
    this.selectionLayer.setSource(layer.getSource());
  }

  /**
   * Select vector features at a given pixel and fires
   * a vector tile select event on selection (select:vectortile).
   * @param e - Map browser event
   * @returns false to stop event propagation if selection is made, true otherwise
   */
  private selectFeaturesAtPixel(e: MapBrowserEvent<UIEvent>): boolean {
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
   * Set features as selected given a list of id.
   * @param featuresId a list of ids
   */
  public setFeaturesById(featuresId: (string | undefined)[] | undefined): void {
    this.clearFeatures();
    featuresId?.forEach((featureId) => {
      if (featureId) this.selectedFeatures.add(featureId);
    });
    this.selectionLayer.changed();
  }
}

export default VectorTileSelect;
