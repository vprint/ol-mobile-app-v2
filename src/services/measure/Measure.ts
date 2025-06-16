import './Measure.css';
import { GeometryType } from 'src/enums/map.enum';
import { EventsKey } from 'ol/events';
import { getUid } from 'ol/util';
import { Interaction } from 'ol/interaction';
import { Feature, Overlay } from 'ol';
import { getArea, getLength } from 'ol/sphere';
import { LineString, Polygon } from 'ol/geom';
import { DrawEventType } from 'src/enums/map.enum';
import { Positioning } from 'ol/Overlay';
import ExtendedDraw, {
  DrawRemoveEvent,
  DrawStartEvent,
} from '../drawer/ExtendedDraw';
import Event from 'ol/events/Event.js';
import Map from 'ol/Map';
import VectorLayer from 'ol/layer/Vector';
import StyleManager from '../StyleManager';
import FeatureHover from '../FeatureHover';
import MeasureModifier from 'src/services/measure/MeasureModifier';
import { LAYER_PROPERTIES_FIELD } from 'src/enums/layers.enum';

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
  MODIFY: 'measure_modify',
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
 * Measure start event. This event is emitted when a draw starts. The event returns the measure feature.
 */
export class MeasureStartEvent extends Event {
  public feature: Feature;

  constructor(type: MeasureEventType.MEASURE_START, feature: Feature) {
    super(type);
    this.feature = feature;
  }
}

/**
 * Measure end event. This event is thrown after the completion of a measure
 */
export class MeasureEndEvent extends Event {}

/**
 * This class provides measurement methods for distances (LineString) and areas (Polygon).
 * A tooltip is generated to show measurements in appropriate units (m, km for linestring and m², km² for polygons).
 */
class Measure extends Interaction {
  public drawInteraction: ExtendedDraw;
  public modifyInteraction: MeasureModifier;

  private readonly featureHover: FeatureHover;
  private events: IMeasureEvents = {
    end: undefined,
    abort: undefined,
    start: undefined,
    remove: undefined,
  };

  private readonly measureStyle = new StyleManager({
    strokeColor: 'rgba(255, 180, 25, 1)',
    fillColor: 'rgba(255, 180, 25, 0.2)',
    strokeWidth: 2,
    lineDash: [2, 6],
  });

  constructor() {
    super();
    this.drawInteraction = this.createDraw();
    this.modifyInteraction = this.createModify(this.drawInteraction.getLayer());
    this.featureHover = this.getFeatureHover();
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
      this.getMap()?.addInteraction(this.featureHover);
    }

    this.addEventsListeners();
  }

  private getFeatureHover(): FeatureHover {
    return FeatureHover.getInstance(this.drawInteraction.getLayer());
  }

  // #region Draw

  /**
   * Returns a draw interaction.
   * @returns The draw interaction.
   */
  private createDraw(): ExtendedDraw {
    const draw = new ExtendedDraw(this.measureStyle);

    draw.getLayer().set(LAYER_PROPERTIES_FIELD, {
      id: 'internal-measure-layer',
      allowSelection: true,
    });

    return draw;
  }

  /**
   * Get the measure layer.
   */
  public getLayer(): VectorLayer {
    return this.drawInteraction.getLayer();
  }

  /**
   * Add measure feature to the map.
   * @param type - Measure type
   */
  public createMeasureFeature(type: IMeasureType): void {
    this.drawInteraction.createFeature(type);
  }

  /**
   * Remove all the measure feature and the associated overlays
   */
  public removeAllMeasures(): void {
    this.drawInteraction.removeAllFeatures();
    this.removeAllOverlays();
    this.modifyInteraction.setActive(false);
    this.featureHover.setActive(false);
  }

  public selectMeasure(feature: Feature): void {
    this.modifyInteraction.addFeature(feature);
  }

  public unselectMeasure(): void {
    this.modifyInteraction.unselectFeature();
  }

  /**
   * Remove a measure and the associated overlay from the map
   */
  public removeSelectedMeasure(): void {
    const selectedMeasure = this.modifyInteraction.getFeature();
    const featureId = getUid(selectedMeasure);

    if (selectedMeasure) {
      this.removeOverlayById(featureId);
      this.unselectMeasure();
      this.drawInteraction
        .getLayer()
        .getSource()
        ?.removeFeature(selectedMeasure);
    }
  }

  /**
   * Abort the current measure
   */
  public abortMeasuring(): void {
    this.drawInteraction.abortDrawing();
  }

  // #region Modify

  /**
   * Returns a modify interaction for feature edition.
   * @param drawLayer - The target layer.
   * @returns Enhanced Modify interaction.
   */
  private createModify(drawLayer: VectorLayer): MeasureModifier {
    return new MeasureModifier({
      style: this.measureStyle,
      layer: drawLayer,
    });
  }

  // #region Tooltip

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
   * Update the tooltip position and values according to the draw.
   * @param feature - Drew feature
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
   * This function set the measure text to the overlay.
   * @param htmlElement - Overlay HTML element
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
   * Calculate measure for a given polygon.
   * @param feature - The input feature
   */
  private calculateMeasure(feature: Feature): string {
    let measure = '';
    const geom = feature.getGeometry();

    switch (geom?.getType()) {
      case GeometryType.POLYGON:
        this.setPolygonArea(feature);
        measure = feature.get(MeasureParameters.FORMATED_MEASURE);
        break;

      case GeometryType.LINE_STRING:
        this.setLineStringArea(feature);
        measure = feature.get(MeasureParameters.FORMATED_MEASURE);
        break;
    }
    return measure;
  }

  private setPolygonArea(feature: Feature): void {
    const geom = feature.getGeometry();
    if (geom) {
      feature.set(
        MeasureParameters.FORMATED_MEASURE,
        this.formatArea(geom as Polygon)
      );
      feature.set(MeasureParameters.RAW_MEASURE, getArea(geom));
    }
  }

  private setLineStringArea(feature: Feature): void {
    const geom = feature.getGeometry();
    if (geom) {
      feature.set(
        MeasureParameters.FORMATED_MEASURE,
        this.formatLength(geom as LineString)
      );
      feature.set(MeasureParameters.RAW_MEASURE, getLength(geom));
    }
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
   * @param polygon - The polygon
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

  // #region Events

  /**
   * Manage the draw-end and draw-abort event.
   */
  private addEventsListeners(): void {
    this.events.end = this.getEndEvent();
    this.events.start = this.getStartEvent();
    this.events.abort = this.getAbortEvent();
    this.events.remove = this.getRemoveEventListener();
  }

  /**
   * Get the draw start event.
   * @returns - The draw start event.
   */
  private getStartEvent(): EventsKey | EventsKey[] {
    return this.drawInteraction.on(
      // @ts-expect-error type error due to a custom event.
      DrawEventType.DRAW_START,
      (evt: DrawStartEvent) => {
        this.modifyInteraction.setActive(false);
        this.featureHover.setActive(false);

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
   * @returns - The draw end event.
   */
  private getEndEvent(): EventsKey | EventsKey[] {
    return this.drawInteraction.on(
      // @ts-expect-error type error due to a custom event
      DrawEventType.DRAW_END,
      () => {
        this.dispatchMeasureEndEvent();
      }
    );
  }

  /**
   * Get the draw abort event.
   * @returns - The draw abort event.
   */
  private getAbortEvent(): EventsKey | EventsKey[] {
    return this.drawInteraction.on(
      // @ts-expect-error type error due to a custom event
      DrawEventType.DRAW_ABORT,
      () => {
        this.dispatchMeasureEndEvent();
        this.getMap()?.getOverlays().pop();
      }
    );
  }

  /**
   * Get the remove event listener.
   * @returns The remove event listener.
   */
  private getRemoveEventListener(): EventsKey | EventsKey[] {
    return this.drawInteraction.on(
      // @ts-expect-error type error due to a custom event
      DrawEventType.DRAW_REMOVE,
      (evt: DrawRemoveEvent) => {
        this.removeOverlayById(evt.featureId);
        this.modifyInteraction.setActive(false);
        this.featureHover.setActive(false);
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
      this.featureHover.setActive(true);
    }, 10);
  }
}

export default Measure;
