import { Interaction } from 'ol/interaction';
import { Map, MapBrowserEvent } from 'ol';
import VectorLayer from 'ol/layer/Vector';

enum MouseEvent {
  POINTER_MOVE = 'pointermove',
}

enum Cursor {
  POINTER = 'pointer',
  DEFAULT = 'default',
}

class FeatureHighLighter extends Interaction {
  private layer: VectorLayer;

  constructor(layer: VectorLayer) {
    super();
    this.layer = layer;
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
   * Check if a feature is hovered for a given layer.
   * @param evt - The map UI event
   * @returns
   */
  private isFeatureHovered(evt: MapBrowserEvent<UIEvent>): boolean {
    let hit: boolean | undefined = false;
    const pixel = this.getMap()?.getEventPixel(evt.originalEvent);

    if (pixel) {
      hit = this.getMap()?.hasFeatureAtPixel(pixel, {
        hitTolerance: 5,
        layerFilter: (layer) => layer === this.layer,
      });
    }

    return hit ?? false;
  }
}

export default FeatureHighLighter;
