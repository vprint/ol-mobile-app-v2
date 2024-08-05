// Map import
import { EventsKey } from 'ol/events';
import { Draw, Interaction } from 'ol/interaction';
import { unByKey } from 'ol/Observable';
import { Feature } from 'ol';
import { getArea, getLength } from 'ol/sphere';
import { LineString, Polygon } from 'ol/geom';
import { Style, Fill, Stroke, Circle, Text } from 'ol/style';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Event from 'ol/events/Event.js';

// Vue/Quasar imports

// Store imports

// Interface imports

// Others imports
import './Measure.css';
import { StyleLike } from 'ol/style/Style';
import { FeatureLike } from 'ol/Feature';

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
    text: new Text({
      font: '12px merriweather sans-serif',
      textBaseline: 'middle',
      fill: new Fill({
        color: 'black',
      }),
      backgroundFill: new Fill({
        color: 'rgba(255, 204, 51, 1)',
      }),
      textAlign: 'center',
      placement: 'point',
    }),
  });

  private drawEndEvent!: EventsKey;
  private drawAbortEvent!: EventsKey;
  private drawStartEvent!: EventsKey;

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
      style: this.styleFunction,
      type: type,
    });
    this.getMap()?.addInteraction(this.drawInteraction);

    this.drawStartEvent = this.drawInteraction.on('drawstart', (evt) => {
      evt.feature.set('formatedMeasure', '');
      evt.feature.set('measure', '');

      this.calculateMeasure(evt.feature);

      this.dispatchEvent(
        new MeasureStartEvent(MeasureEventType.MEASURE_START, evt.feature)
      );
    });

    // Manage draw end and abort.
    this.manageDrawEnd(this.drawInteraction);
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

      const measureLayer = this.measureLayer;

      measureLayer.setStyle(this.styleFunction);
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
   * @param Feature Input feature
   */
  private calculateMeasure(feature: Feature): void {
    const geom = feature.getGeometry();
    geom?.on('change', () => {
      // Calculate area if geometry is a polygon
      if (geom instanceof Polygon) {
        feature.set('formatedMeasure', this.formatArea(geom));
        feature.set('measure', getArea(geom));
      }
      // Calculate length if geometry is a line
      else if (geom instanceof LineString) {
        feature.set('formatedMeasure', this.formatLength(geom));
        feature.set('measure', getLength(geom));
      }
    });
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

  private styleFunction = (feature: FeatureLike, resolution: number): Style => {
    this.style.getText()?.setText(feature.get('formatedMeasure'));
    this.style.getText()?.setScale(10 / resolution);
    return this.style;
  };
}

export default Measure;
