import { DrawEventType } from '../../enums/draw-types.enum';
import Event from 'ol/events/Event.js';

/**
 * Draw remove event. The removed feature id is returned by the event.
 */
export class DrawRemoveEvent extends Event {
  public featureId: number | string;

  constructor(type: DrawEventType.DRAW_REMOVE, featureId: number | string) {
    super(type);
    this.featureId = featureId;
  }
}
