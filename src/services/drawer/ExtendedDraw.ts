import type { Type } from 'ol/geom/Geometry';
import type { EventsKey } from 'ol/events';
import { InteractionSettings } from 'src/enums/map.enum';
import { DrawEventType } from 'src/enums/map.enum';
import { Draw, Interaction } from 'ol/interaction';
import { unByKey } from 'ol/Observable';
import { Feature, Map } from 'ol';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import StyleManager from '../StyleManager';
import Event from 'ol/events/Event.js';

/**
 * Draw abort event. This event is throwed after a completion of a draw.
 */
export class DrawAbortEvent extends Event {}

/**
 * Draw end event. This event is throwed after a completion of a draw.
 */
export class DrawEndEvent extends Event {}

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

/**
 * Draw start event. This event is emmited when a draw start. The feature is returned by the event.
 */
export class DrawStartEvent extends Event {
  public feature: Feature;

  constructor(type: DrawEventType.DRAW_START, feature: Feature) {
    super(type);
    this.feature = feature;
  }
}

interface IDrawerEvents {
  end: EventsKey | EventsKey[] | undefined;
  abort: EventsKey | EventsKey[] | undefined;
  start: EventsKey | EventsKey[] | undefined;
}

/**
 * Provides function to manage draw
 */
class ExtendedDraw extends Interaction {
  private drawInteraction: Draw | undefined;
  private readonly drawLayer: VectorLayer;
  private style: StyleManager;

  private events: IDrawerEvents = {
    end: undefined,
    abort: undefined,
    start: undefined,
  };

  constructor(interactionName: string, style: StyleManager) {
    super();
    this.set(InteractionSettings.NAME, interactionName);
    this.style = style;
    this.drawLayer = this.createDrawLayer();
  }

  /**
   * Returns the layer on which the drawing is made.
   * @returns - The drawing layer.
   */
  public getLayer(): VectorLayer {
    return this.drawLayer;
  }

  /**
   * Initialize the component.
   * @param map - OpenLayers map
   */
  public setMap(map: Map | null): void {
    super.setMap(map);

    if (map) {
      map.addLayer(this.drawLayer);
      this.drawLayer.setStyle(this.style.getStyle());
    }
  }

  /**
   * Create a draw layer.
   * @returns - The draw layer.
   */
  private createDrawLayer(): VectorLayer {
    return new VectorLayer({
      source: new VectorSource(),
      visible: true,
      zIndex: Infinity,
    });
  }

  /**
   * Add a new draw interaction to the map.
   * @param type - Draw type
   */
  public createFeature(type: Type): void {
    this.removeDrawInteraction();
    this.createDraw(type);
    this.addEventsListeners();
  }

  /**
   * Create a new openlayers draw interaction.
   * @param type - The type of draw.
   * @returns - The draw interaction.
   */
  private createDraw(type: Type): void {
    const drawSource = this.drawLayer.getSource();

    this.drawInteraction = new Draw({
      source: drawSource ? drawSource : new VectorSource(),
      style: this.style.getEditionStyle(),
      type: type,
    });

    this.getMap()?.addInteraction(this.drawInteraction);
  }

  /**
   * Remove interaction and event listener.
   */
  public removeDrawInteraction(): void {
    if (this.drawInteraction) {
      this.getMap()?.removeInteraction(this.drawInteraction);
      this.drawInteraction.dispose();
    }

    this.removeEventsListeners();
  }

  /**
   * Clear the draw layer and deactivate draw interaction.
   */
  public removeAllFeatures(): void {
    this.removeDrawInteraction();
    this.drawLayer.getSource()?.clear();
  }

  /**
   * Abort the current draw.
   */
  public abortDrawing(): void {
    this.drawInteraction?.abortDrawing();
  }

  // #region Events

  /**
   * Throw a new draw end event.
   * A timeout is applied to avoid unwanted zoom and selection after a double click.
   */
  private dispatchEndEvent(): void {
    setTimeout(() => {
      this.dispatchEvent(new DrawEndEvent(DrawEventType.DRAW_END));
      this.removeDrawInteraction();
    }, 50);
  }

  /**
   * Throw a new draw abort event.
   */
  private dispatchAbortEvent(): void {
    this.dispatchEvent(new DrawAbortEvent(DrawEventType.DRAW_ABORT));
    this.removeDrawInteraction();
  }

  // #region Listeners

  /**
   * Manage the draw events.
   */
  private addEventsListeners(): void {
    this.events.start = this.drawInteraction?.on(
      DrawEventType.DRAW_START,
      (evt) => {
        this.dispatchEvent(
          new DrawStartEvent(DrawEventType.DRAW_START, evt.feature)
        );
      }
    );

    this.events.end = this.drawInteraction?.on(DrawEventType.DRAW_END, () =>
      this.dispatchEndEvent()
    );

    this.events.abort = this.drawInteraction?.on(DrawEventType.DRAW_ABORT, () =>
      this.dispatchAbortEvent()
    );
  }

  private removeEventsListeners(): void {
    if (this.events.end) {
      unByKey(this.events.end);
      this.events.end = undefined;
    }

    if (this.events.abort) {
      unByKey(this.events.abort);
      this.events.abort = undefined;
    }

    if (this.events.start) {
      unByKey(this.events.start);
      this.events.start = undefined;
    }
  }
}

export default ExtendedDraw;
