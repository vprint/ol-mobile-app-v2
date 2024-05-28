// Map import
import { Feature, Map } from 'ol';
import LineString from 'ol/geom/LineString';
import Polygon from 'ol/geom/Polygon';
import { Draw } from 'ol/interaction.js';
import VectorSource from 'ol/source/Vector';

// Store import

// Other import

/**
 * This plugins allow to create a measure interaction
 */
export default class MeasurePlugin {
  public map: Map;
  public isActive = false;
  public drawInteraction: Draw;
  public measureAsString = '';
  public sketch?: Feature;

  constructor(map: Map) {
    this.map = map;
    this.drawInteraction = this.createDraw();
    this.initializeEventHandlers();
  }

  /**
   * Initialize draw event handler
   */
  private initializeEventHandlers(): void {
    this.map.addInteraction(this.drawInteraction);
    this.drawInteraction.on('drawstart', (evt) => {
      this.sketch = evt.feature;

      this.sketch.getGeometry()?.on('change', (evt) => {
        const geom = evt.target;
        if (geom instanceof Polygon) {
          this.measureAsString = this.formatArea(geom);
        } else if (geom instanceof LineString) {
          this.measureAsString = this.formatLength(geom);
        }
      });
    });
    this.drawInteraction.on(['drawend', 'drawabort'], () => {
      this.drawInteraction.setActive(false);
    });
  }

  /**
   * Create a ready to use draw interaction
   * @returns Draw interaction
   */
  private createDraw(): Draw {
    const draw = new Draw({
      source: new VectorSource(),
      type: 'LineString',
    });
    draw.setActive(false);
    return draw;
  }

  /**
   * Activate measure tool
   */
  public addMeasure(): void {
    if (!this.isActive) {
      this.drawInteraction.setActive(true);
      this.isActive = true;
    }
  }

  /**
   * Deactivate measure tool
   */
  public removeMeasure(): void {
    if (this.isActive) {
      this.drawInteraction.setActive(false);
      this.isActive = false;
    }
  }

  /**
   * Format length output.
   * @param line The line
   * @returns The formatted length.
   */
  private formatLength = function (line: LineString): string {
    const length = line.getLength();
    let output: string;

    if (length > 100) {
      output = `${Math.round((length / 1000) * 100) / 100} km`;
    } else {
      output = `${Math.round(length * 100) / 100} km`;
    }
    return output;
  };

  /**
   * Format area output
   * @param polygon The polygone
   * @returns Formatted area
   */
  private formatArea = function (polygon: Polygon): string {
    const area = polygon.getArea();
    let output: string;

    if (area > 10000) {
      output = `${Math.round((area / 1000000) * 100) / 100} km<sup>2</sup>`;
    } else {
      output = `${Math.round(area * 100) / 100} m<sup>2</sup>`;
    }
    return output;
  };
}
