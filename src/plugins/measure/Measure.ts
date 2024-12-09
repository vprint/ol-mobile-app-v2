import { EventsKey } from 'ol/events';
import { Draw, Interaction, Modify, Select } from 'ol/interaction';
import { unByKey } from 'ol/Observable';
import { Feature, Map, Overlay } from 'ol';
import { click } from 'ol/events/condition';
import { getArea, getLength } from 'ol/sphere';
import { Geometry, LineString, MultiPoint, Polygon } from 'ol/geom';
import { Style, Fill, Stroke, Circle } from 'ol/style';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Event from 'ol/events/Event.js';
import { getUid } from 'ol/util';
import { Coordinate } from 'ol/coordinate';
import './Measure.css';
import Drawer from '../drawer';

/**
 * Measure event definition
 */
export enum MeasureEventType {
  MEASURE_START = 'measure:start',
  MEASURE_END = 'measure:end',
}

type IMeasureType = 'Polygon' | 'LineString';

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
class Measure {
  private measureLayer: VectorLayer | undefined;

  private measureStyle = new Style({
    fill: new Fill({
      color: 'rgba(255, 180, 25, 0.2)',
    }),
    stroke: new Stroke({
      color: 'rgba(255, 180, 25, 1)',
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
        color: 'rgba(255, 180, 25, 1)',
      }),
    }),
  });

  private selectedMeasureStyle = [
    new Style({
      stroke: new Stroke({
        color: 'rgba(255, 180, 25, 1)',
        lineCap: 'round',
        lineDash: [2, 6],
        width: 3,
      }),
    }),
    new Style({
      fill: new Fill({
        color: 'rgba(255, 180, 25, 0.2)',
      }),
      stroke: new Stroke({
        color: 'rgba(255, 255, 255, 0.2)',
        lineCap: 'round',
        width: 6,
      }),
    }),
    new Style({
      image: new Circle({
        radius: 5,
        stroke: new Stroke({
          color: 'rgba(255, 255, 255, 1)',
          width: 2,
        }),
        fill: new Fill({
          color: 'rgba(255, 180, 25, 1)',
        }),
      }),
      geometry: (feature): Geometry | undefined => {
        const geom = feature.getGeometry();
        let coordinates: Coordinate[] | undefined;

        if (geom instanceof Polygon) {
          coordinates = geom.getCoordinates()[0];
        }
        if (geom instanceof LineString) {
          coordinates = geom.getCoordinates();
        }

        return coordinates ? new MultiPoint(coordinates) : undefined;
      },
    }),
  ];

  /**
   * Add the measure layer to the map
   * @param map OpenLayers map
   */
  private addMeasureLayer(map: Map): void {
    const measureLayer = new VectorLayer({
      source: new VectorSource(),
      visible: true,
      zIndex: Infinity,
    });

    map.addLayer(measureLayer);
    measureLayer.setStyle(this.style);
    this.measureLayer = measureLayer;
  }

  /**
   * Add measure interaction to the map.
   * @param type Measure type
   */
  public addMeasureFeature(type: IMeasureType): void {
    const drawSource = this.measureLayer?.getSource();

    // Create draw interaction.
    this.drawInteraction = new Draw({
      source: drawSource ? drawSource : new VectorSource(),
      style: this.style,
      type: type,
    });

    this.getMap()?.addInteraction(this.drawInteraction);

    this.drawStartEvent = this.drawInteraction.on('drawstart', (evt) => {
      this.removeMeasureModifier();

      evt.feature.set('formatedMeasure', '');
      evt.feature.set('measure', '');

      const fid = getUid(evt.feature);
      const measureTooltip = this.createTooltip(fid);
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
  private manageDrawEnd(drawInteraction: Draw): void {
    this.drawEndEvent = drawInteraction.on('drawend', () => {
      this.dispatchDrawEndEvent();
      this.addMeasureModifier();
    });

    this.drawAbortEvent = drawInteraction.on('drawabort', () => {
      this.dispatchDrawEndEvent();
      this.getMap()?.getOverlays().pop();
    });
  }

  /**
   * Throw a new measure end event.
   * A timeout is applied to avoid unwanted zoom after a double click.
   */
  private dispatchDrawEndEvent(): void {
    setTimeout(() => {
      this.dispatchEvent(new MeasureEndEvent(MeasureEventType.MEASURE_END));
      this.deactivateMeasure();
    }, 10);
  }

  /**
   * Remove interaction and event listener.
   */
  public deactivateMeasure(): void {
    if (this.drawInteraction) {
      this.getMap()?.removeInteraction(this.drawInteraction);
    }

    unByKey(this.drawEndEvent);
    unByKey(this.drawAbortEvent);
    unByKey(this.drawStartEvent);

    this.setActive(false);
  }

  /**
   * Clear the measure layer and deactivate measure
   */
  public clearMeasureFeatures(): void {
    this.deactivateMeasure();
    this.removeMeasureModifier();
    this.removeAllMeasureOverlays();
    this.measureLayer?.getSource()?.clear();
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
   * Add a select and modify interactions to the measure layer
   */
  private addMeasureModifier(): void {
    if (this.measureLayer?.getSource()) {
      this.selectInteraction = new Select({
        layers: (layer): boolean => {
          return getUid(layer) === getUid(this.measureLayer);
        },
        condition: click,
        style: this.selectedStyle,
        hitTolerance: 15,
      });

      this.modifyInteraction = new Modify({
        style: this.style,
        features: this.selectInteraction.getFeatures(),
      });

      this.getMap()?.addInteraction(this.selectInteraction);
      this.getMap()?.addInteraction(this.modifyInteraction);
    }
  }

  /**
   * Remove select and modify interactions
   */
  public removeMeasureModifier(): void {
    if (this.modifyInteraction && this.selectInteraction) {
      this.getMap()?.removeInteraction(this.modifyInteraction);
      this.getMap()?.removeInteraction(this.selectInteraction);
    }
  }

  /**
   * Remove all measure overlays
   */
  private removeAllMeasureOverlays(): void {
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
  private removeOverlayById(id: string): void {
    const overlays = this.getMap()?.getOverlays().getArray();

    if (overlays) {
      const measureOverlay = overlays.find((overlay) => overlay.getId() === id);
      if (measureOverlay) {
        this.getMap()?.removeOverlay(measureOverlay);
      }
    }
  }

  /**
   * Clear selection if the user press escape key.
   * @param evt a keyboard event
   */
  clearSelection = (evt: KeyboardEvent): void => {
    if (evt.key === 'Escape') {
      this.selectInteraction?.getFeatures().clear();
    }
  };

  /**
   * Delete the selected measure if the user click on delete key.
   * @param evt a keyboard event
   */
  deleteSelectedMeasure = (evt: KeyboardEvent): void => {
    if (evt.key === 'Delete') {
      const feature = this.selectInteraction?.getFeatures().getArray()[0];

      if (feature) {
        const fid = getUid(feature);
        const measureFeatures = this.measureLayer?.getSource()?.getFeatures();
        const measureToDelete = measureFeatures?.find(
          (measureFeature) => getUid(measureFeature) === fid
        );
        this.removeMeasureFeature(measureToDelete);
      }
    }
  };

  /**
   * Remove a measure feature from the map
   * @param feature Measure feature to remove
   */
  private removeMeasureFeature(feature: Feature): void {
    this.measureLayer?.getSource()?.removeFeature(feature);
    this.selectInteraction?.getFeatures().clear();
    this.removeOverlayById(getUid(feature));
  }
}

export default Measure;
