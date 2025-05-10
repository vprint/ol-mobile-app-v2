import { Interaction } from 'ol/interaction';
import { Map, MapBrowserEvent } from 'ol';
import { FeatureLike } from 'ol/Feature';
import VectorTileLayer from 'ol/layer/VectorTile';
import Event from 'ol/events/Event.js';
import { Fill, Stroke, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { getUid } from 'ol/util.js';
import { MouseEvent } from 'src/enums/ui-event.enum';

export enum VectorTileRenderType {
  HYBRID = 'hybrid',
  VECTOR = 'vector',
}

/**
 * Vector tile select event type definition
 */
export enum VectorTileSelectEventType {
  VECTOR_TILE_SELECT = 'select:vectortile',
}

export interface IOptions {
  /**
   * The layer on which the selection should be made.
   */
  selectableLayer: VectorTileLayer;

  /**
   * The style to apply on the selected feature.
   */
  selectionStyle?: Style;
}

/**
 * Vector tile selection event
 */
export class VectorTileSelectEvent extends Event {
  public selected: FeatureLike[] | undefined;
  private mapBrowserEvent: MapBrowserEvent;

  constructor(
    type: VectorTileSelectEventType,
    selected: FeatureLike[] | undefined,
    mapBrowserEvent: MapBrowserEvent
  ) {
    super(type);
    this.selected = selected;
    this.mapBrowserEvent = mapBrowserEvent;
  }
}

/**
 * Provides methods for selection over vector tile layer.
 */
class VectorTileSelect extends Interaction {
  public selectedFeatures = new Set<string>();
  private selectableLayer: VectorTileLayer;
  private selectionStyle: Style;

  /**
   * The layer on which the selected feature is rendered.
   */
  private renderLayer: VectorTileLayer;

  constructor(options: IOptions) {
    super({
      handleEvent: (evt: MapBrowserEvent): boolean =>
        this.selectFeaturesAtPixel(evt),
    });

    this.selectableLayer = options.selectableLayer;
    this.renderLayer = this.createRenderingLayer();
    this.setSelectionLayer(options.selectableLayer);
    this.selectionStyle = this.createSelectionStyle(options.selectionStyle);
  }

  /**
   * Initialize the component
   * @param map - OpenLayers map
   */
  public setMap(map: Map | null): void {
    super.setMap(map);
    this.getMap()?.addLayer(this.renderLayer);
  }

  /**
   * Create a selection style.
   * @param userStyle - The user style.
   * @returns A style to apply on selected feature.
   */
  private createSelectionStyle(userStyle: Style | undefined): Style {
    let style = userStyle;
    if (!style) {
      style = new Style({
        image: new CircleStyle({
          radius: 10,
          fill: new Fill({ color: '#3399CC' }),
          stroke: new Stroke({ color: '#fff', width: 2 }),
        }),
      });
    }
    return style;
  }

  /**
   * Create a layer that will render the selected features.
   * @returns The rendering layer.
   */
  private createRenderingLayer(): VectorTileLayer {
    return new VectorTileLayer({
      renderMode: VectorTileRenderType.VECTOR,
      zIndex: this.getSelectionZIndex(),
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
   * Set the selection layer
   * @param layer - The layer where the feature should be selected
   */
  private setSelectionLayer(layer: VectorTileLayer): void {
    this.selectableLayer = layer;
    this.renderLayer.setSource(layer.getSource() ?? null);
    this.renderLayer.setZIndex(this.getSelectionZIndex());
  }

  /**
   * Select vector features at a given pixel and fires
   * a vector tile select event on selection (select:vectortile).
   * @param e - Map browser event
   * @returns - false to stop event propagation if selection is made, true otherwise
   */
  private selectFeaturesAtPixel(e: MapBrowserEvent): boolean {
    let propagation = true;

    if (e.type === MouseEvent.CLICK.toString()) {
      const features = this.getMap()?.getFeaturesAtPixel(e.pixel, {
        layerFilter: (layer) => getUid(layer) === getUid(this.selectableLayer),
        hitTolerance: 10,
      });

      const featureIds = features?.map((feature) =>
        feature.getId()?.toString()
      );
      this.setAsSelected(featureIds);

      this.dispatchEvent(
        new VectorTileSelectEvent(
          VectorTileSelectEventType.VECTOR_TILE_SELECT,
          features,
          e
        )
      );
      propagation = false;
    }

    return propagation;
  }

  /**
   * Clear selected features.
   */
  public clear(): void {
    this.selectedFeatures.clear();
    this.renderLayer.changed();
  }

  /**
   * Set features as selected given a list of id.
   * @param featuresId - A list of ids.
   */
  public setAsSelected(featuresId: (string | undefined)[] | undefined): void {
    this.clear();
    featuresId?.forEach((featureId) => {
      if (featureId) this.selectedFeatures.add(featureId);
    });
    this.renderLayer.changed();
  }

  /**
   * Calculate the selection layer zIndex based on the selectable layer zIndex.
   * @returns The zIndex (selectable layer + 1)
   */
  private getSelectionZIndex(): number {
    let zIndex = Infinity;
    const selectableLayerZIndex = this.selectableLayer.getZIndex();

    if (selectableLayerZIndex) {
      zIndex = selectableLayerZIndex + 1;
    }

    return zIndex;
  }
}

export default VectorTileSelect;
