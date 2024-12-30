import './Measure.css';
import { GeometryType } from 'src/enums/geometry.enum';
import { EventsKey } from 'ol/events';
import { IStyleOptions } from '../StyleManager';
import { getUid } from 'ol/util';
import { Interaction } from 'ol/interaction';
import { Feature, Overlay } from 'ol';
import { getArea, getLength } from 'ol/sphere';
import { LineString, Polygon } from 'ol/geom';
import { DrawStartEvent } from '../../services/drawer/drawStartEvent';
import { DrawRemoveEvent } from '../../services/drawer/DrawRemoveEvent';
import { DrawEventType } from 'src/enums/draw-types.enum';
import Event from 'ol/events/Event.js';
import Map from 'ol/Map';
import Drawer from '../../services/drawer/Drawer';

/**
 * Measure event definition
 */
export enum MeasureEventType {
  MEASURE_START = 'measure:start',
  MEASURE_END = 'measure:end',
}

type IMeasureType = GeometryType.POLYGON | GeometryType.LINE_STRING;

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
 * This class provides measurement functionality for distances (LineString) and areas (Polygon).
 * A tooltip is generated to show measurements in appropriate units (m, km for linestrings and m², km² for polygons).
 * These tooltips can be managed by removeAllMeasureOverlays() and removeOverlayById() functions.
 *
 * @extends Interaction
 */
class Measure extends Interaction {
  private drawInteraction: Drawer;
  private measureStartEvent!: EventsKey;
  private measureEndEvent!: EventsKey;
  private measureAbortEvent!: EventsKey;

  private measureStyle: IStyleOptions = {
    strokeColor: 'rgba(255, 180, 25, 1)',
    fillColor: 'rgba(255, 180, 25, 0.2)',
    strokeWidth: 2,
    lineDash: [2, 6],
  };

  constructor(interactionName: string) {
    super();
    this.set('name', interactionName);
    this.drawInteraction = new Drawer(
      `${interactionName}-drawer`,
      this.measureStyle
    );

    this.handleRemoveMeasure();
  }

  /**
   * Initialize the component
   * @param map OpenLayers map
   */
  public setMap(map: Map | null): void {
    super.setMap(map);
    if (map) this.getMap()?.addInteraction(this.drawInteraction);

    this.measureStartEvent = this.drawInteraction.on(
      // @ts-expect-error type error due to custom event
      DrawEventType.DRAW_START,
      (evt: DrawStartEvent) => {
        evt.feature.set('formatedMeasure', '');
        evt.feature.set('measure', '');

        const fid = getUid(evt.feature);
        const measureTooltip = this.createTooltip(fid);
        this.updateTooltip(evt.feature, measureTooltip);

        this.dispatchEvent(
          new MeasureStartEvent(MeasureEventType.MEASURE_START, evt.feature)
        );
      }
    );

    // Manage measure end and abort.
    this.manageMeasureEnd(this.drawInteraction);
  }

  /**
   * Add measure interaction to the map.
   * @param type Measure type
   */
  public addMeasureFeature(type: IMeasureType): void {
    this.drawInteraction.addFeature(type);
  }

  /**
   * Update the tooltip position and values according to the draw.
   * @param feature Drawed feature
   * @param tooltip Overlay
   */
  private updateTooltip(feature: Feature, tooltip: Overlay): void {
    feature.on('change', () => {
      const geom = feature.getGeometry();

      if (geom instanceof Polygon) {
        tooltip.setPosition(geom.getInteriorPoint().getCoordinates());
        tooltip.setPositioning('center-center');
        this.setTooltipText(tooltip.getElement(), feature);
      } else if (geom instanceof LineString) {
        tooltip.setPosition(geom.getLastCoordinate());
        tooltip.setOffset([15, 15]);
        this.setTooltipText(tooltip.getElement(), feature);
      }
    });
  }

  /**
   * This function set the measure text to the overlay.
   * @param htmlElement Overlay html element
   * @param feature Draw feature
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
   * @param drawInteraction Draw plugin
   */
  private manageMeasureEnd(drawInteraction: Drawer): void {
    this.measureEndEvent = drawInteraction.on(
      // @ts-expect-error type error due to custom event
      DrawEventType.DRAW_END,
      () => {
        this.dispatchMeasureEndEvent();
      }
    );

    this.measureAbortEvent = drawInteraction.on(
      // @ts-expect-error type error due to custom event
      DrawEventType.DRAW_ABORT,
      () => {
        this.dispatchMeasureEndEvent();
        this.getMap()?.getOverlays().pop();
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
    }, 10);
  }

  /**
   * Calculate measure for a given polygon.
   * @param geom Input geometry
   */
  private calculateMeasure(feature: Feature): string {
    const geom = feature.getGeometry();
    // Calculate area if geometry is a polygon
    if (geom instanceof Polygon) {
      feature.set('formatedMeasure', this.formatArea(geom));
      feature.set('measure', getArea(geom));
      return feature.get('formatedMeasure');
    }
    // Calculate length if geometry is a line
    else if (geom instanceof LineString) {
      feature.set('formatedMeasure', this.formatLength(geom));
      feature.set('measure', getLength(geom));
      return feature.get('formatedMeasure');
    }
    return '';
  }

  /**
   * Format length output.
   * @param line The line
   * @returns The formatted length.
   */
  private formatLength(line: LineString): string {
    const length = getLength(line);
    let output: string;

    if (length > 100) {
      output = `${Math.round((length / 1000) * 100) / 100} km`;
    } else {
      output = `${Math.round(length * 100) / 100} m`;
    }
    return output;
  }

  /**
   * Format area output.
   * @param polygon The polygone
   * @returns Formatted area
   */
  private formatArea(polygon: Polygon): string {
    const area = getArea(polygon);
    let output: string;

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
  private createTooltip(id: string): Overlay {
    const measureTooltipElement = document.createElement('div');

    const measureTooltip = new Overlay({
      element: measureTooltipElement,
      className: 'measure-tooltip merriweather',
      stopEvent: false,
      id: id,
    });

    measureTooltip.set('type', 'measure');

    this.getMap()?.addOverlay(measureTooltip);

    return measureTooltip;
  }

  /**
   * Remove all measure overlays
   */
  private removeAllOverlays(): void {
    const overlays = this.getMap()?.getOverlays().getArray();

    if (overlays) {
      const measureOverlays = overlays.filter(
        (overlay) => overlay.get('type') === 'measure'
      );

      measureOverlays.forEach((overlay) => {
        this.getMap()?.removeOverlay(overlay);
      });
    }
  }

  /**
   * Remove an overlay for a given id
   * @param id Overlay id
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
   * @param feature Measure feature to remove
   */
  public removeFeature(): void {
    const drawModifier = this.drawInteraction.getDrawModifier();
    const selectedMeasure = drawModifier?.getFeature();
    this.removeOverlayById(getUid(selectedMeasure));
    drawModifier?.removeFeature();
  }

  /**
   * Remove all the measure feature and the associated overlays
   */
  public removeAllFeatures(): void {
    this.drawInteraction.removeAllFeatures();
    this.removeAllOverlays();
  }

  /**
   * Abort the current measure
   */
  public abortMeasuring(): void {
    this.drawInteraction.abortDrawing();
  }

  /**
   * Clear the tooltip associated to the removed draw.
   */
  private handleRemoveMeasure = (): void => {
    this.drawInteraction.on(
      // @ts-expect-error type error due to custom event
      DrawEventType.DRAW_REMOVE,
      (evt: DrawRemoveEvent) => {
        this.removeOverlayById(evt.featureId);
      }
    );
  };
}

export default Measure;
