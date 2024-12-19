import type { Type } from 'ol/geom/Geometry';
import type { EventsKey } from 'ol/events';
import { KeyEventType } from 'src/enums/key-event.enum';
import { DrawEventType } from 'src/enums/draw-types.enum';
import { DrawStartEvent } from './drawStartEvent';
import { DrawEndEvent } from './DrawEndEvent';
import { DrawAbortEvent } from './DrawAbortEvent';
import { DrawRemoveEvent } from './DrawRemoveEvent';
import { Draw, Interaction } from 'ol/interaction';
import { unByKey } from 'ol/Observable';
import { Map } from 'ol';
import { getUid } from 'ol/util';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import StyleManager, { IStyleOptions } from '../StyleManager';
import DrawModifier from './DrawModifier';

/**
 * Provides function to manage draw
 * @extends Interaction
 */
class Drawer extends Interaction {
  private drawInteraction: Draw | undefined;
  private drawModifier: DrawModifier | undefined;

  private drawLayer: VectorLayer | undefined;
  private style: StyleManager;

  private endEvent!: EventsKey;
  private abortEvent!: EventsKey;
  private startEvent!: EventsKey;

  constructor(interactionName: string, style: IStyleOptions) {
    super();
    this.set('name', interactionName);
    this.style = new StyleManager(style);
    document.addEventListener('keydown', this.handleKeyPress);
  }

  /**
   * Initialize the component
   * @param map OpenLayers map
   */
  public setMap(map: Map | null): void {
    super.setMap(map);
    if (map) this.addDrawLayer(map);
  }

  /**
   * Add the draw layer to the map
   * @param map OpenLayers map
   */
  private addDrawLayer(map: Map): void {
    const drawLayer = new VectorLayer({
      source: new VectorSource(),
      visible: true,
      zIndex: Infinity,
    });

    map.addLayer(drawLayer);
    drawLayer.setStyle(this.style.getStyle());
    this.drawLayer = drawLayer;
  }

  /**
   * Add a draw selector and modifier to the map
   */
  private addModifier(): void {
    this.drawModifier = new DrawModifier(
      `${this.get('name')}-modifier`,
      this.style,
      this.drawLayer
    );

    this.getMap()?.addInteraction(this.drawModifier);
  }

  /**
   * Add draw interaction to the map.
   * @param type - Draw type
   */
  public addFeature(type: Type): void {
    const drawSource = this.drawLayer?.getSource();

    // Create draw interaction.
    this.drawInteraction = new Draw({
      source: drawSource ? drawSource : new VectorSource(),
      style: this.style.getEditionStyle(),
      type: type,
    });
    this.getMap()?.addInteraction(this.drawInteraction);

    this.startEvent = this.drawInteraction.on(
      DrawEventType.DRAW_START,
      (evt) => {
        this.drawModifier?.removeModifier();
        this.dispatchEvent(
          new DrawStartEvent(DrawEventType.DRAW_START, evt.feature)
        );
      }
    );

    // Manage draw end and abort.
    this.manageEvent(this.drawInteraction);
  }

  /**
   * Manage draw-end and draw-abort event.
   * @param drawInteraction Draw plugin
   */
  private manageEvent(drawInteraction: Draw): void {
    this.endEvent = drawInteraction.on(DrawEventType.DRAW_END, () => {
      this.dispatchEndEvent();
    });

    this.abortEvent = drawInteraction.on(DrawEventType.DRAW_ABORT, () => {
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
      this.addModifier();
    }, 50);
  }

  /**
   * Throw a new draw abort event.
   */
  private dispatchAbortEvent(): void {
    this.dispatchEvent(new DrawAbortEvent(DrawEventType.DRAW_ABORT));
    this.deactivateDraw();
    this.addModifier();
  }

  /**
   * Remove interaction and event listener.
   */
  public deactivateDraw(): void {
    if (this.drawInteraction) {
      this.getMap()?.removeInteraction(this.drawInteraction);
    }

    unByKey(this.endEvent);
    unByKey(this.abortEvent);
    unByKey(this.startEvent);
  }

  /**
   * Clear the draw layer and deactivate draw interaction.
   */
  public removeAllFeatures(): void {
    this.deactivateDraw();
    this.drawModifier?.removeModifier();
    this.drawLayer?.getSource()?.clear();
  }

  /**
   * Return the layer where the draw is made.
   * @returns
   */
  public getDrawLayer(): VectorLayer | undefined {
    return this.drawLayer;
  }

  /**
   * Abort the current draw.
   */
  public abortDrawing(): void {
    this.drawInteraction?.abortDrawing();
  }

  /**
   * Get the draw modifier.
   * @returns
   */
  public getDrawModifier(): DrawModifier | undefined {
    return this.drawModifier;
  }

  private handleKeyPress = (evt: KeyboardEvent): void => {
    switch (evt.key) {
      case KeyEventType.ESCAPE:
        this.abortDrawing();
        this.drawModifier?.unselectFeature();
        break;

      case KeyEventType.DELETE:
        const feature = this.drawModifier?.getFeature();
        if (!feature) return;
        const featureId = getUid(feature);
        this.dispatchEvent(
          new DrawRemoveEvent(DrawEventType.DRAW_REMOVE, featureId)
        );
        this.drawModifier?.removeFeature();
    }
  };
}

export default Drawer;
