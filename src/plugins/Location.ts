import { Feature } from 'ol';
import { Interaction } from 'ol/interaction';
import { Fill, Stroke, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import Geolocation from 'ol/Geolocation.js';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { easeOut } from 'ol/easing';
import { Point } from 'ol/geom';
import { EventsKey } from 'ol/events';
import { unByKey } from 'ol/Observable';
import Event from 'ol/events/Event.js';

/**
 * Enum of all location events.
 */
export enum LocationEventsType {
  LOCATION_FOUND = 'location:found',
  LOCATION_ERROR = 'location:error',
}

/**
 * Location events manager.
 */
export class LocationEvents extends Event {}

/**
 * This class add a location tracker to the map.
 * The user can set the position and accuracy style.
 */
class Location extends Interaction {
  public trackingEnabled = false;
  private hasZoomedToLocation = false;

  private positionFeature: Feature | undefined;
  private accuracyFeature: Feature | undefined;

  private geolocation: Geolocation;
  private locationLayer: VectorLayer;

  private positionStyle: Style;
  private accuracyStyle: Style;

  private featureAddTracker!: EventsKey;
  private accuracyTracker!: EventsKey;
  private positionTracker!: EventsKey;
  private errorTracker!: EventsKey;

  private isInitialized = false;

  constructor(
    interactionName: string,
    newPositionStyle?: Style,
    newAccuracyStyle?: Style
  ) {
    super();
    this.set('name', interactionName);

    this.locationLayer = new VectorLayer({
      source: new VectorSource(),
      zIndex: Infinity,
    });

    this.positionStyle =
      newPositionStyle ??
      new Style({
        image: new CircleStyle({
          radius: 6,
          fill: new Fill({
            color: '#3399CC',
          }),
          stroke: new Stroke({
            color: '#fff',
            width: 2,
          }),
        }),
      });

    this.accuracyStyle =
      newAccuracyStyle ??
      new Style({
        fill: new Fill({
          color: 'rgba(51, 153, 204, 0.2)',
        }),
      });

    this.geolocation = new Geolocation({
      trackingOptions: {
        enableHighAccuracy: true,
      },
      projection: this.getMap()?.getView().getProjection(),
    });
  }

  /**
   * Log location error in the console
   */
  private handleError(): void {
    this.geolocation.on('error', (error) => {
      console.error(error);
      this.dispatchEvent(new LocationEvents(LocationEventsType.LOCATION_ERROR));
    });
  }

  /**
   * Track accuracy change and update the accuracy geometry
   */
  private trackAccuracy(): void {
    this.geolocation.on('change:accuracyGeometry', () => {
      const accuracy = this.geolocation.getAccuracyGeometry();
      this.accuracyFeature?.setGeometry(accuracy ? accuracy : undefined);
    });
  }

  /**
   * Track position change and update position geometry
   */
  private trackPosition(): void {
    this.geolocation.on('change:position', () => {
      const coordinates = this.geolocation.getPosition();
      if (coordinates) {
        const point = new Point(coordinates);
        this.positionFeature?.setGeometry(point);

        if (!this.hasZoomedToLocation) {
          const extent = point.getExtent();
          this.getMap()?.getView().fit(extent, {
            maxZoom: 15,
            duration: 500,
            easing: easeOut,
          });
          this.hasZoomedToLocation = true;
          this.dispatchEvent(
            new LocationEvents(LocationEventsType.LOCATION_FOUND)
          );
        }
      }
    });
  }

  /**
   * Enable / disable tracking
   * @param enable Should the tracking be enabled ?
   */
  public enableTracking(enable: boolean): void {
    this.geolocation.setTracking(enable);
    this.trackingEnabled = enable;

    this.initializeParameters();

    this.locationLayer.getSource()?.clear();
    this.hasZoomedToLocation = false;

    unByKey(this.featureAddTracker);
    unByKey(this.accuracyTracker);
    unByKey(this.positionTracker);
    unByKey(this.errorTracker);

    if (enable) {
      this.positionFeature = new Feature();
      this.positionFeature.setStyle(this.positionStyle);

      this.accuracyFeature = new Feature();
      this.accuracyFeature.setStyle(this.accuracyStyle);

      this.locationLayer
        .getSource()
        ?.addFeatures([this.positionFeature, this.accuracyFeature]);

      this.trackAccuracy();
      this.trackPosition();
      this.handleError();
    }
  }

  /**
   * Initialize location parameters and add the location layer to the map
   */
  private initializeParameters(): void {
    if (!this.isInitialized) {
      this.geolocation.setProjection(this.getMap()?.getView().getProjection());
      this.getMap()?.addLayer(this.locationLayer);
      this.isInitialized = true;
    }
  }
}

export default Location;
