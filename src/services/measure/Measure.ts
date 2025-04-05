import './Measure.css';
import { GeometryType } from 'src/enums/geometry.enum';
import { EventsKey } from 'ol/events';
import { getUid } from 'ol/util';
import { Interaction } from 'ol/interaction';
import { Feature, Overlay } from 'ol';
import { getArea, getLength } from 'ol/sphere';
import { LineString, Polygon } from 'ol/geom';
import { DrawStartEvent } from '../../services/drawer/drawStartEvent';
import { DrawRemoveEvent } from '../../services/drawer/DrawRemoveEvent';
import { DrawEventType } from 'src/enums/draw-types.enum';
import { Positioning } from 'ol/Overlay';
import Event from 'ol/events/Event.js';
import Map from 'ol/Map';
import ExtendedDraw from '../drawer/ExtendedDraw';
import ExtendedModify from '../drawer/ExtendedModify';
import VectorLayer from 'ol/layer/Vector';
import StyleManager, { IStyleOptions } from '../StyleManager';
import FeatureHighLighter from '../FeatureHighlighter';
/**
 * Measure event definition
 */
export enum MeasureEventType {
  MEASURE_START = 'measure:start',
  MEASURE_END = 'measure:end',
}

interface IMeasureParameters {
  TYPE: string;
  DRAW: string;
  MODIFY: string;
  MEASURE: string;
  TOOLTIP_OFFSET: number[];
  RAW_MEASURE: string;
  TOOLTIP_POSITIONING: Positioning;
  FORMATED_MEASURE: string;
}

const MeasureParameters: IMeasureParameters = {
  TYPE: 'type',
  DRAW: 'draw',
  MODIFY: 'modify',
  MEASURE: 'measure',
  TOOLTIP_OFFSET: [15, 15],
  RAW_MEASURE: 'measure',
  TOOLTIP_POSITIONING: 'center-center',
  FORMATED_MEASURE: 'formatedMeasure',
};

type IMeasureType = GeometryType.POLYGON | GeometryType.LINE_STRING;

interface IMeasureEvents {
  end: EventsKey | EventsKey[] | undefined;
  abort: EventsKey | EventsKey[] | undefined;
  start: EventsKey | EventsKey[] | undefined;
  remove: EventsKey | EventsKey[] | undefined;
}

/**
 * Measure start event. This event is emmited when a draw start. The measure feature is returned by the event.
 */
export class MeasureStartEvent extends Event {
  public feature: Feature;

  constructor(type: MeasureEventType.MEASURE_START, feature: Feature) {
    super(type);
    this.feature = feature;
  }
}

/**
 * Measure end event. This event is throwed after a completion of a measure
 */
export class MeasureEndEvent extends Event {}

/**
 * This class provides measurement methods for distances (LineString) and areas (Polygon).
 * A tooltip is generated to show measurements in appropriate units (m, km for linestrings and m², km² for polygons).
 */
class Measure extends Interaction {
  private drawInteraction: ExtendedDraw;
  private modifyInteraction: ExtendedModify;
  private featureHighlighter: FeatureHighLighter;
  private events: IMeasureEvents = {
    end: undefined,
    abort: undefined,
    start: undefined,
    remove: undefined,
  };

  private measureStyle: IStyleOptions = {
    strokeColor: 'rgba(255, 180, 25, 1)',
    fillColor: 'rgba(255, 180, 25, 0.2)',
    strokeWidth: 2,
    lineDash: [2, 6],
  };

  constructor(interactionName: string) {
    super();
    this.set('name', interactionName);
    this.drawInteraction = this.getDraw(interactionName);
    this.modifyInteraction = this.getModify(
      interactionName,
      this.drawInteraction.getLayer()
    );
    this.featureHighlighter = this.getFeatureHighLigher();
  }

  /**
   * Returns a draw interaction.
   * @param interactionName - Unique identifier of the interaction.
   * @returns Enhanced draw interaction.
   */
  private getDraw(interactionName: string): ExtendedDraw {
    return new ExtendedDraw(
      `${interactionName}-${MeasureParameters.DRAW}`,
      new StyleManager(this.measureStyle)
    );
  }

  /**
   * Returns a modify interaction for feature editing.
   * @param interactionName - Unique identifier of the interaction.
   * @param draw - The target layer.
   * @returns Enhanced Modify interaction.
   */
  private getModify(
    interactionName: string,
    drawLayer: VectorLayer
  ): ExtendedModify {
    return new ExtendedModify({
      name: `${interactionName}-${MeasureParameters.MODIFY}`,
      style: new StyleManager(this.measureStyle),
      layer: drawLayer,
    });
  }

  /**
   * Initialize the component
   * @param map - OpenLayers map
   */
  public setMap(map: Map | null): void {
    super.setMap(map);
    if (map) {
      this.getMap()?.addInteraction(this.drawInteraction);
      this.getMap()?.addInteraction(this.modifyInteraction);
      this.getMap()?.addInteraction(this.featureHighlighter);
    }

    this.addEventsListeners(this.drawInteraction);
  }

  /**
   * Add measure interaction to the map.
   * @param type - Measure type
   */
  public createMeasureFeature(type: IMeasureType): void {
    this.drawInteraction.createFeature(type);
  }

  /**
   * Update the tooltip position and values according to the draw.
   * @param feature - Drawed feature
   * @param tooltip - Overlay
   */
  private updateTooltip(feature: Feature, tooltip: Overlay): void {
    feature.on('change', () => {
      const geom = feature.getGeometry();

      switch (geom?.getType()) {
        case GeometryType.POLYGON:
          tooltip.setPosition(
            (geom as Polygon).getInteriorPoint().getCoordinates()
          );
          tooltip.setPositioning(MeasureParameters.TOOLTIP_POSITIONING);
          this.setTooltipText(tooltip.getElement(), feature);
          break;

        case GeometryType.LINE_STRING:
          tooltip.setPosition((geom as LineString).getLastCoordinate());
          tooltip.setOffset(MeasureParameters.TOOLTIP_OFFSET);
          this.setTooltipText(tooltip.getElement(), feature);
          break;
      }
    });
  }

  /**
   * This function set the measure text to the overlay.
   * @param htmlElement - Overlay html element
   * @param feature - Draw feature
   */
  private setTooltipText(
    htmlElement: HTMLElement | undefined,
    feature: Feature
  ): void {
    if (htmlElement) {
      htmlElement.innerHTML = this.calculateMeasure(feature);
    }
  }

  /**
   * Manage draw-end and draw-abort event.
   * @param drawInteraction - Draw plugin
   */
  private addEventsListeners(drawInteraction: ExtendedDraw): void {
    this.events.end = this.getEndEvent(drawInteraction);
    this.events.start = this.getStartEvent(drawInteraction);
    this.events.abort = this.getAbortEvent(drawInteraction);
    this.events.remove = this.getRemoveEventListener(drawInteraction);
  }

  /**
   * Get the draw start event.
   * @param draw - The draw interaction.
   * @returns - The draw start event.
   */
  private getStartEvent(draw: ExtendedDraw): EventsKey | EventsKey[] {
    return draw.on(
      // @ts-expect-error type error due to custom event.
      DrawEventType.DRAW_START,
      (evt: DrawStartEvent) => {
        this.modifyInteraction.setActive(false);
        this.featureHighlighter.setActive(false);
        evt.feature.set(MeasureParameters.FORMATED_MEASURE, '');
        evt.feature.set(MeasureParameters.RAW_MEASURE, '');

        this.createTooltip(evt.feature);

        this.dispatchEvent(
          new MeasureStartEvent(MeasureEventType.MEASURE_START, evt.feature)
        );
      }
    );
  }

  /**
   * Get the draw end event.
   * @param draw - The draw interaction.
   * @returns - The draw end event.
   */
  private getEndEvent(draw: ExtendedDraw): EventsKey | EventsKey[] {
    return draw.on(
      // @ts-expect-error type error due to custom event
      DrawEventType.DRAW_END,
      () => {
        this.dispatchMeasureEndEvent();
      }
    );
  }

  /**
   * Get the draw abort event.
   * @param draw - The draw interaction.
   * @returns - The draw abort event.
   */
  private getAbortEvent(draw: ExtendedDraw): EventsKey | EventsKey[] {
    return draw.on(
      // @ts-expect-error type error due to custom event
      DrawEventType.DRAW_ABORT,
      () => {
        this.dispatchMeasureEndEvent();
        this.getMap()?.getOverlays().pop();
      }
    );
  }

  /**
   * Get the remove event listener.
   * @param draw - The draw interaction.
   * @returns The remove event listener.
   */
  private getRemoveEventListener(draw: ExtendedDraw): EventsKey | EventsKey[] {
    return draw.on(
      // @ts-expect-error type error due to custom event
      DrawEventType.DRAW_REMOVE,
      (evt: DrawRemoveEvent) => {
        this.removeOverlayById(evt.featureId);
        this.modifyInteraction.setActive(false);
        this.featureHighlighter.setActive(false);
      }
    );
  }

  /**
   * Throw a new measure end event.
   * A timeout is applied to avoid unwanted zoom after a double click.
   */
  private dispatchMeasureEndEvent(): void {
    setTimeout(() => {
      this.dispatchEvent(new MeasureEndEvent(MeasureEventType.MEASURE_END));
      this.modifyInteraction.setActive(true);
      this.featureHighlighter.setActive(true);
    }, 10);
  }

  /**
   * Calculate measure for a given polygon.
   * @param geom - Input geometry
   */
  private calculateMeasure(feature: Feature): string {
    let measure = '';
    const geom = feature.getGeometry();

    switch (geom?.getType()) {
      case GeometryType.POLYGON:
        feature.set(
          MeasureParameters.FORMATED_MEASURE,
          this.formatArea(geom as Polygon)
        );
        feature.set(MeasureParameters.RAW_MEASURE, getArea(geom));
        measure = feature.get(MeasureParameters.FORMATED_MEASURE);
        break;

      case GeometryType.LINE_STRING:
        feature.set(
          MeasureParameters.FORMATED_MEASURE,
          this.formatLength(geom as LineString)
        );
        feature.set(MeasureParameters.RAW_MEASURE, getLength(geom));
        measure = feature.get(MeasureParameters.FORMATED_MEASURE);
        break;
    }

    return measure;
  }

  /**
   * Format length output.
   * @param line - The line
   * @returns The formatted length.
   */
  private formatLength(line: LineString): string {
    let output: string;
    const length = getLength(line);

    if (length > 100) {
      output = `${Math.round((length / 1000) * 100) / 100} km`;
    } else {
      output = `${Math.round(length * 100) / 100} m`;
    }
    return output;
  }

  /**
   * Format area output.
   * @param polygon - The polygone
   * @returns Formatted area
   */
  private formatArea(polygon: Polygon): string {
    let output: string;
    const area = getArea(polygon);

    if (area > 10000) {
      output = `${Math.round((area / 1000000) * 100) / 100} km²`;
    } else {
      output = `${Math.round(area * 100) / 100} m²`;
    }
    return output;
  }

  /**
   * Create and add a new overlay to the map
   * @returns New overlay
   */
  private createTooltip(feature: Feature): void {
    const measureTooltipElement = document.createElement('div');

    const measureTooltip = new Overlay({
      element: measureTooltipElement,
      className: 'measure-tooltip app-font',
      stopEvent: false,
      id: getUid(feature),
    });

    measureTooltip.set(MeasureParameters.TYPE, MeasureParameters.MEASURE);
    this.getMap()?.addOverlay(measureTooltip);
    this.updateTooltip(feature, measureTooltip);
  }

  /**
   * Remove all measure overlays
   */
  private removeAllOverlays(): void {
    const overlays = this.getMap()?.getOverlays().getArray();

    if (overlays) {
      const measureOverlays = overlays.filter(
        (overlay) =>
          overlay.get(MeasureParameters.TYPE) === MeasureParameters.MEASURE
      );

      measureOverlays.forEach((overlay) => {
        this.getMap()?.removeOverlay(overlay);
      });
    }
  }

  /**
   * Remove an overlay for a given id
   * @param id - Overlay id
   */
  private removeOverlayById(id: string | number): void {
    const overlays = this.getMap()?.getOverlays().getArray();

    if (overlays) {
      const measureOverlay = overlays.find((overlay) => overlay.getId() === id);
      if (measureOverlay) {
        this.getMap()?.removeOverlay(measureOverlay);
      }
    }
  }

  /**
   * Remove a measure and the associated overlay from the map
   */
  public removeMeasure(): void {
    const selectedMeasure = this.modifyInteraction.getFeature();
    if (selectedMeasure) {
      this.removeOverlayById(getUid(selectedMeasure));
      this.modifyInteraction.removeFeature();
    }
  }

  /**
   * Remove all the measure feature and the associated overlays
   */
  public removeAllMeasures(): void {
    this.drawInteraction.removeAllFeatures();
    this.removeAllOverlays();
    this.modifyInteraction.setActive(false);
    this.featureHighlighter.setActive(false);
  }

  /**
   * Abort the current measure
   */
  public abortMeasuring(): void {
    this.drawInteraction.abortDrawing();
  }

  private getFeatureHighLigher(): FeatureHighLighter {
    return new FeatureHighLighter(this.drawInteraction.getLayer());
  }
}

export default Measure;
