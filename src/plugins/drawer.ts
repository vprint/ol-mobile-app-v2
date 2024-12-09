import type { Type } from 'ol/geom/Geometry';
import type { EventsKey } from 'ol/events';
import { Draw, Interaction, Modify, Select } from 'ol/interaction';
import { unByKey } from 'ol/Observable';
import { Feature, Map } from 'ol';
import { click } from 'ol/events/condition';
import { getUid } from 'ol/util';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Event from 'ol/events/Event.js';
import StyleManager, { IStyleOptions } from './StyleManager';

/**
 * Draw event definition
 */
export enum DrawEventType {
  DRAW_START = 'draw:start',
  DRAW_END = 'draw:end',
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

/**
 * Draw end event. This event is throwed after a completion of a draw.
 */
export class DrawEndEvent extends Event {}

/**
 * Provides function to manage draw
 * @extends Interaction
 */
class Drawer extends Interaction {
  private drawInteraction: Draw | undefined;
  private modifyInteraction: Modify | undefined;
  private selectInteraction: Select | undefined;
  private drawLayer: VectorLayer | undefined;
  private style: StyleManager;

  private drawEndEvent!: EventsKey;
  private drawAbortEvent!: EventsKey;
  private drawStartEvent!: EventsKey;

  constructor(interactionName: string, style: IStyleOptions) {
    super();
    this.set('name', interactionName);
    this.style = new StyleManager(style);

    document.addEventListener('keydown', this.unselectDraw);
    document.addEventListener('keydown', this.deleteSelectedDraw);
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
   * Add draw interaction to the map.
   * @param type - Draw type
   */
  public addDrawFeature(type: Type): void {
    const drawSource = this.drawLayer?.getSource();

    // Create draw interaction.
    this.drawInteraction = new Draw({
      source: drawSource ? drawSource : new VectorSource(),
      style: this.style.getEditionStyle(),
      type: type,
    });

    this.getMap()?.addInteraction(this.drawInteraction);

    this.drawStartEvent = this.drawInteraction.on('drawstart', (evt) => {
      this.removeDrawModifier();

      this.dispatchEvent(
        new DrawStartEvent(DrawEventType.DRAW_START, evt.feature)
      );
    });

    // Manage draw end and abort.
    this.manageDrawEnd(this.drawInteraction);
  }

  /**
   * Manage draw-end and draw-abort event.
   * @param drawInteraction Draw plugin
   */
  private manageDrawEnd(drawInteraction: Draw): void {
    this.drawEndEvent = drawInteraction.on('drawend', () => {
      this.dispatchDrawEndEvent();
      this.addDrawModifier();
    });

    this.drawAbortEvent = drawInteraction.on('drawabort', () => {
      this.dispatchDrawEndEvent();
      this.getMap()?.getOverlays().pop();
    });
  }

  /**
   * Throw a new draw end event.
   * A timeout is applied to avoid unwanted zoom after a double click.
   */
  private dispatchDrawEndEvent(): void {
    setTimeout(() => {
      this.dispatchEvent(new DrawEndEvent(DrawEventType.DRAW_END));
      this.deactivateDraw();
    }, 10);
  }

  /**
   * Remove interaction and event listener.
   */
  public deactivateDraw(): void {
    if (this.drawInteraction) {
      this.getMap()?.removeInteraction(this.drawInteraction);
    }

    unByKey(this.drawEndEvent);
    unByKey(this.drawAbortEvent);
    unByKey(this.drawStartEvent);

    this.setActive(false);
  }

  /**
   * Clear the draw layer and deactivate draw interaction.
   */
  public clearAllDrawFeatures(): void {
    this.deactivateDraw();
    this.removeDrawModifier();
    this.drawLayer?.getSource()?.clear();
  }

  /**
   * Add a select and modify interactions to the draw layer
   */
  private addDrawModifier(): void {
    if (this.drawLayer?.getSource()) {
      this.selectInteraction = new Select({
        layers: (layer): boolean => {
          return getUid(layer) === getUid(this.drawLayer);
        },
        condition: click,
        style: this.style.getSelectionStyle(),
        hitTolerance: 15,
      });

      this.modifyInteraction = new Modify({
        style: this.style.getEditionStyle(),
        features: this.selectInteraction.getFeatures(),
      });

      this.getMap()?.addInteraction(this.selectInteraction);
      this.getMap()?.addInteraction(this.modifyInteraction);
    }
  }

  /**
   * Remove select and modify interactions
   */
  public removeDrawModifier(): void {
    if (this.modifyInteraction && this.selectInteraction) {
      this.getMap()?.removeInteraction(this.modifyInteraction);
      this.getMap()?.removeInteraction(this.selectInteraction);
    }
  }

  /**
   * Clear selection if the user press escape key.
   * @param evt a keyboard event
   */
  unselectDraw = (evt: KeyboardEvent): void => {
    if (evt.key === 'Escape') {
      this.selectInteraction?.getFeatures().clear();
    }
  };

  /**
   * Delete the selected draw if the user click on delete key.
   * @param evt a keyboard event
   */
  deleteSelectedDraw = (evt: KeyboardEvent): void => {
    if (evt.key === 'Delete') {
      const feature = this.selectInteraction?.getFeatures().getArray()[0];

      if (feature) {
        const fid = getUid(feature);
        const drawFeatures = this.drawLayer?.getSource()?.getFeatures();
        const drawToDelete = drawFeatures?.find(
          (drawFeature) => getUid(drawFeature) === fid
        );
        this.removeDrawFeature(drawToDelete);
      }
    }
  };

  /**
   * Remove a draw from the map
   * @param feature - Draw feature to remove
   */
  protected removeDrawFeature(feature: Feature): void {
    this.drawLayer?.getSource()?.removeFeature(feature);
    this.selectInteraction?.getFeatures().clear();
  }
}

export default Drawer;
