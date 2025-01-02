import { DrawEventType } from '../../enums/draw-types.enum';
import Feature from 'ol/Feature';
import BaseEvent from 'ol/events/Event.js';

/**
 * Draw start event. This event is emmited when a draw start. The feature is returned by the event.
 */
export class DrawStartEvent extends BaseEvent {
  public feature: Feature;

  constructor(type: DrawEventType.DRAW_START, feature: Feature) {
    super(type);
    this.feature = feature;
  }
}
