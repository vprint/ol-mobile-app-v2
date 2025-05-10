import { Interaction } from 'ol/interaction';
import { Map, MapBrowserEvent } from 'ol';
import { Cursor, MouseEvent } from 'src/enums/ui-event.enum';
import VectorLayer from 'ol/layer/Vector';
import VectorTileLayer from 'ol/layer/VectorTile';

class FeatureHover extends Interaction {
  private static instance: FeatureHover | undefined;
  private layers = new Set<VectorLayer | VectorTileLayer>();

  private constructor(layer: VectorLayer | VectorTileLayer | undefined) {
    super();
    if (layer) this.layers.add(layer);
  }

  public setMap(map: Map | null): void {
    super.setMap(map);
    this.addPointerMoveListener();
  }

  /**
   * Add pointer move listener to change cursor on hover
   */
  private addPointerMoveListener(): void {
    const map = this.getMap();
    if (map) {
      map.on(MouseEvent.POINTER_MOVE, (evt) => {
        const hit = this.isFeatureHovered(evt);
        map.getTargetElement().style.cursor = hit
          ? Cursor.POINTER
          : Cursor.DEFAULT;
      });
    }
  }

  /**
   * Check if a feature is hovered for a given set of layers.
   * @param evt - The map UI event
   * @returns
   */
  private isFeatureHovered(evt: MapBrowserEvent): boolean {
    let hit: boolean | undefined = false;
    const pixel = this.getMap()?.getEventPixel(evt.originalEvent);

    if (pixel) {
      hit = this.getMap()?.hasFeatureAtPixel(pixel, {
        hitTolerance: 5,
        layerFilter: (layer) =>
          this.layers.has(layer as VectorLayer | VectorTileLayer),
      });
    }

    return hit ?? false;
  }

  public static getInstance(
    layer?: VectorLayer | VectorTileLayer
  ): FeatureHover {
    if (!FeatureHover.instance) {
      FeatureHover.instance = new FeatureHover(layer);
    }

    if (layer) {
      FeatureHover.instance.layers.add(layer);
    }

    return FeatureHover.instance;
  }

  public addLayer(layer: VectorLayer | VectorTileLayer): void {
    FeatureHover.instance?.layers.add(layer);
  }
}

export default FeatureHover;
