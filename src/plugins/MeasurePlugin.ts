// Map import
import { EventsKey } from 'ol/events';
import { Draw, Interaction } from 'ol/interaction';
import { unByKey } from 'ol/Observable';
import VectorSource from 'ol/source/Vector';
import Event from 'ol/events/Event.js';
import { Feature } from 'ol';

// Vue/Quasar imports

// Store imports

// Interface imports

// Others imports

/**
 * Measure end event definition
 */
export enum MeasureEventType {
  MEASURE_START = 'measure:start',
  MEASURE_END = 'measure:end',
}

export type IMeasureType = 'Polygon' | 'LineString';

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
 * A measure interaction that return a string formated measure (formatedMeasure) and a raw measure
 */
class MeasurePlugin extends Interaction {
  public formatedMeasure = '';
  public measure = 0;
  private drawInteraction: Draw | undefined;
  private layerSource = new VectorSource();

  private drawEndEvent: EventsKey[] = [];
  private drawStartEvent!: EventsKey;

  constructor(name: string) {
    super();
    this.set('name', name);
  }

  /**
   * Add measure interaction to the map
   * @param type Measure type
   */
  public addMeasure(type: IMeasureType): void {
    // Create draw interaction.
    this.drawInteraction = new Draw({
      source: this.layerSource,
      type: type,
    });

    // Add draw interaction to the map.
    this.getMap()?.addInteraction(this.drawInteraction);

    // Listen for draw change and calculate area and length.
    this.drawStartEvent = this.drawInteraction.on('drawstart', (evt) => {
      const sketch = evt.feature;

      this.dispatchEvent(
        new MeasureStartEvent(MeasureEventType.MEASURE_START, sketch)
      );
    });

    // Manage draw end and abort.
    this.drawEndEvent = this.drawInteraction.on(
      ['drawend', 'drawabort'],
      () => {
        // As the user double-click to end draw, this can lead to an unvolutary zoom. This timeout prevent this behaviour.
        setTimeout(() => {
          this.dispatchEvent(new MeasureEndEvent(MeasureEventType.MEASURE_END));
        }, 50);

        this.formatedMeasure = '';
        this.measure = 0;
      }
    );
  }

  /**
   * Remove interaction and event listener
   */
  public removeMeasure(): void {
    if (this.drawInteraction) {
      this.getMap()?.removeInteraction(this.drawInteraction);
    }

    this.drawEndEvent.forEach((event) => {
      unByKey(event);
    });

    unByKey(this.drawStartEvent);

    this.setActive(false);
  }
}

export default MeasurePlugin;
