import type { Type } from 'ol/geom/Geometry';
import type { EventsKey } from 'ol/events';
import { DrawEventType } from 'src/enums/draw-types.enum';
import { DrawStartEvent } from './drawStartEvent';
import { DrawEndEvent } from './DrawEndEvent';
import { DrawAbortEvent } from './DrawAbortEvent';
import { Draw, Interaction } from 'ol/interaction';
import { unByKey } from 'ol/Observable';
import { Map } from 'ol';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import StyleManager from '../StyleManager';

interface IDrawerEvents {
  end: EventsKey | EventsKey[] | undefined;
  abort: EventsKey | EventsKey[] | undefined;
  start: EventsKey | EventsKey[] | undefined;
}

/**
 * Provides function to manage draw
 * @extends Interaction
 */
class ExtendedDraw extends Interaction {
  private drawInteraction: Draw | undefined;

  private drawLayer: VectorLayer;
  private style: StyleManager;

  private events: IDrawerEvents = {
    end: undefined,
    abort: undefined,
    start: undefined,
  };

  constructor(interactionName: string, style: StyleManager) {
    super();
    this.set('name', interactionName);
    this.style = style;
    this.drawLayer = this.createDrawLayer();
  }

  /**
   * Initialize the component.
   * @param map - OpenLayers map
   */
  public setMap(map: Map | null): void {
    super.setMap(map);
    if (map) this.addDrawLayer(map);
  }

  /**
   * Add the draw layer to the map.
   * @param map - OpenLayers map
   */
  private addDrawLayer(map: Map): void {
    map.addLayer(this.drawLayer);
    this.drawLayer.setStyle(this.style.getStyle());
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
    const drawSource = this.drawLayer.getSource();
    this.drawInteraction = this.createDraw(drawSource, type);
    this.getMap()?.addInteraction(this.drawInteraction);
    this.manageEvent(this.drawInteraction);
  }

  /**
   * Create a new openlayers draw interaction.
   * @param drawSource - The layer where the draw should be made.
   * @param type - The type of draw.
   * @returns - The draw interaction.
   */
  private createDraw(
    drawSource: VectorSource | null | undefined,
    type: Type
  ): Draw {
    return new Draw({
      source: drawSource ? drawSource : new VectorSource(),
      style: this.style.getEditionStyle(),
      type: type,
    });
  }

  /**
   * Manage the draw events.
   * @param drawInteraction - Draw plugin
   */
  private manageEvent(drawInteraction: Draw): void {
    this.events.start = drawInteraction.on(DrawEventType.DRAW_START, (evt) => {
      this.dispatchEvent(
        new DrawStartEvent(DrawEventType.DRAW_START, evt.feature)
      );
    });

    this.events.end = drawInteraction.on(DrawEventType.DRAW_END, () => {
      this.dispatchEndEvent();
    });

    this.events.abort = drawInteraction.on(DrawEventType.DRAW_ABORT, () => {
      this.dispatchAbortEvent();
    });
  }

  /**
   * Throw a new draw end event.
   * A timeout is applied to avoid unwanted zoom and selection after a double click.
   */
  private dispatchEndEvent(): void {
    setTimeout(() => {
      this.dispatchEvent(new DrawEndEvent(DrawEventType.DRAW_END));
      this.deactivateDraw();
    }, 50);
  }

  /**
   * Throw a new draw abort event.
   */
  private dispatchAbortEvent(): void {
    this.dispatchEvent(new DrawAbortEvent(DrawEventType.DRAW_ABORT));
    this.deactivateDraw();
  }

  /**
   * Remove interaction and event listener.
   */
  public deactivateDraw(): void {
    if (this.drawInteraction) {
      this.drawInteraction.setActive(false);
    }

    if (this.events.end) unByKey(this.events.end);
    if (this.events.abort) unByKey(this.events.abort);
    if (this.events.start) unByKey(this.events.start);
  }

  /**
   * Clear the draw layer and deactivate draw interaction.
   */
  public removeAllFeatures(): void {
    this.deactivateDraw();
    this.drawLayer.getSource()?.clear();
  }

  /**
   * Returns the layer on which the drawing is made.
   * @returns - The drawing layer.
   */
  public getLayer(): VectorLayer {
    return this.drawLayer;
  }

  /**
   * Abort the current draw.
   */
  public abortDrawing(): void {
    this.drawInteraction?.abortDrawing();
  }
}

export default ExtendedDraw;
