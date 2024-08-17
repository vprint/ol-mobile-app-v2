// Map import
import { EventsKey } from 'ol/events';
import { Draw, Interaction } from 'ol/interaction';
import { unByKey } from 'ol/Observable';
import { Feature, Overlay } from 'ol';
import { getArea, getLength } from 'ol/sphere';
import { Geometry, LineString, Polygon } from 'ol/geom';
import { Style, Fill, Stroke, Circle } from 'ol/style';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Event from 'ol/events/Event.js';

// Vue/Quasar imports

// Store imports

// Interface imports

// Others imports
import './Measure.css';

/**
 * Measure end event definition
 */
export enum MeasureEventType {
  MEASURE_START = 'measure:start',
  MEASURE_END = 'measure:end',
}

export type IMeasureType = 'Polygon' | 'LineString';

//const { getLayerByName } = useMapStore();

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
 * A measure interaction that return a string formated measure (formatedMeasure) and a raw measure.
 */
class Measure extends Interaction {
  private drawInteraction: Draw | undefined;
  private measureLayer: VectorLayer;
  private drawEndEvent!: EventsKey;
  private drawAbortEvent!: EventsKey;
  private drawStartEvent!: EventsKey;

  private style = new Style({
    fill: new Fill({
      color: 'rgba(255, 200, 50, 0.2)',
    }),
    stroke: new Stroke({
      color: 'rgba(255, 200, 50, 1)',
      lineCap: 'round',
      lineDash: [2, 6],
      width: 2,
    }),
    image: new Circle({
      radius: 5,
      stroke: new Stroke({
        color: 'rgba(255, 255, 255, 1)',
        width: 2,
      }),
      fill: new Fill({
        color: 'rgba(255, 200, 50, 1)',
      }),
    }),
  });

  constructor(name: string, measureLayer: VectorLayer) {
    super();
    this.set('name', name);
    this.measureLayer = measureLayer;
  }

  /**
   * Add measure interaction to the map.
   * @param type Measure type
   */
  public addMeasure(type: IMeasureType): void {
    const drawSource = this.measureLayer.getSource();

    // Create draw interaction.
    this.drawInteraction = new Draw({
      source: drawSource ? drawSource : new VectorSource(),
      style: this.style,
      type: type,
    });
    this.getMap()?.addInteraction(this.drawInteraction);

    this.drawStartEvent = this.drawInteraction.on('drawstart', (evt) => {
      evt.feature.set('formatedMeasure', '');
      evt.feature.set('measure', '');

      const measureTooltip = this.createTooltip();
      this.updateTooltip(evt.feature, measureTooltip);

      this.dispatchEvent(
        new MeasureStartEvent(MeasureEventType.MEASURE_START, evt.feature)
      );
    });

    // Manage draw end and abort.
    this.manageDrawEnd(this.drawInteraction);
  }

  /**
   * Update the tooltip position and values according to the draw.
   * @param sketch Draw geometry
   * @param tooltip Overlay
   */
  private updateTooltip(sketch: Feature, tooltip: Overlay): void {
    sketch.on('change', () => {
      const geom = sketch.getGeometry();

      if (geom instanceof Polygon) {
        tooltip.setPosition(geom.getInteriorPoint().getCoordinates());
        tooltip.setPositioning('center-center');
        this.setTooltipText(tooltip.getElement(), sketch);
      } else if (geom instanceof LineString) {
        tooltip.setPosition(geom.getLastCoordinate());
        tooltip.setOffset([15, 15]);
        this.setTooltipText(tooltip.getElement(), sketch);
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
   * This function remove event listener, reset measure values and throw a new measure end event.
   * @param drawInteraction Draw plugin
   */
  private manageDrawEnd(drawInteraction: Draw): void {
    this.drawEndEvent = drawInteraction.on('drawend', () => {
      // As the user double-click to end draw, this can lead to an unvolutary zoom. This ugly timeout prevent this behaviour.
      setTimeout(() => {
        this.dispatchEvent(new MeasureEndEvent(MeasureEventType.MEASURE_END));
        this.removeMeasure();
      }, 10);

      this.formatedMeasure = '';
      this.measure = 0;

      const measureLayer = this.measureLayer;
      measureLayer.setStyle(this.style);
      measureLayer.setStyle(this.getStyle());
    });

    this.drawAbortEvent = drawInteraction.on('drawabort', () => {
      setTimeout(() => {
        this.dispatchEvent(new MeasureEndEvent(MeasureEventType.MEASURE_END));
        this.removeMeasure();
      }, 10);

      this.getMap()?.getOverlays().pop();
    });
  }

  /**
   * Remove interaction and event listener.
   */
  public removeMeasure(): void {
    if (this.drawInteraction) {
      this.getMap()?.removeInteraction(this.drawInteraction);
    }

    unByKey(this.drawEndEvent);
    unByKey(this.drawAbortEvent);
    unByKey(this.drawStartEvent);

    this.setActive(false);
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
  private createTooltip(): Overlay {
    const measureTooltipElement = document.createElement('div');

    const measureTooltip = new Overlay({
      element: measureTooltipElement,
      className: 'measure-tooltip merriweather',
      stopEvent: false,
    });

    measureTooltip.set('type', 'measure');

    this.getMap()?.addOverlay(measureTooltip);

    return measureTooltip;
  }

  /**
   * Get measure style
   * @returns Measure style
   */
  private getStyle(): Style {
    const style = new Style({
      fill: new Fill({
        color: 'rgba(255, 200, 50, 0.2)',
      }),
      stroke: new Stroke({
        color: 'rgba(255, 200, 50, 1)',
        lineCap: 'round',
        lineDash: [2, 6],
        width: 2,
      }),
      image: new Circle({
        radius: 5,
        stroke: new Stroke({
          color: 'rgba(255, 255, 255, 1)',
          width: 2,
        }),
        fill: new Fill({
          color: 'rgba(255, 200, 50, 1)',
        }),
      }),
    });

    return style;
  }
}

export default Measure;
