import { Feature, Map } from 'ol';
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
  VIEW_MODIFICATION = 'location:view-modification',
}

/**
 * Location events manager.
 */
export class LocationEvents extends Event {}

/**
 * This class add a location tracker to the map.
 * The user can set the position and accuracy style.
 *
 * @extends Interaction
 */
class Location extends Interaction {
  private isViewCentered = false;
  private isLocationFound = false;
  private positionFeature: Feature | undefined;
  private accuracyFeature: Feature | undefined;
  private locationLayer: VectorLayer;
  private positionStyle: Style;
  private accuracyStyle: Style;
  private geolocation: Geolocation;
  private featureAddTracker!: EventsKey;
  private accuracyTracker!: EventsKey;
  private positionTracker!: EventsKey;
  private errorTracker!: EventsKey;

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
   * Initialize component.
   * @param map OpenLayers map.
   */
  public setMap(map: Map | null): void {
    super.setMap(map);
    this.geolocation.setProjection(this.getMap()?.getView().getProjection());
    this.getMap()?.addLayer(this.locationLayer);
  }

  /**
   * Get the position feature
   * @returns Position feature (point).
   */
  public getPositionFeature(): Feature | undefined {
    return this.positionFeature;
  }

  /**
   * Get information about view centering
   * @returns true if the view is centered on the accuracy feature, false otherwise.
   */
  public getViewCentered(): boolean {
    return this.isViewCentered;
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

        if (!this.isLocationFound) {
          const locationFoundCallback = (): void => {
            this.isLocationFound = true;
            this.dispatchEvent(
              new LocationEvents(LocationEventsType.LOCATION_FOUND)
            );
            this.addViewChangeListener();
            this.isViewCentered = true;
          };
          this.fitViewToLocation(locationFoundCallback);
        }
      }
    });
  }

  /**
   * Manage the map view change and throw a view change event.
   */
  public addViewChangeListener = (): void => {
    this.getMap()
      ?.getView()
      .once('change', (): void => {
        this.isViewCentered = false;
        this.dispatchEvent(
          new LocationEvents(LocationEventsType.VIEW_MODIFICATION)
        );
      });
  };

  /**
   * Fit the map view to the location extent and execute a callback if necessary.
   * @param callback Function to execute after the map fit.
   */
  public fitViewToLocation(callback?: () => void): void {
    const animationDuration = 500;
    const extent = this.accuracyFeature?.getGeometry()?.getExtent();

    if (extent) {
      this.getMap()
        ?.getView()
        .fit(extent, {
          maxZoom: 15,
          duration: animationDuration,
          easing: easeOut,
          callback: callback ? callback : undefined,
        });
    }
  }

  /**
   * Set the tracking active
   * @param enable - enable / disable the tracking.
   */
  public setActive(enable: boolean): void {
    super.setActive(enable);
    this.geolocation.setTracking(enable);

    this.locationLayer.getSource()?.clear();
    this.isLocationFound = false;

    this.removeEventsListeners();

    if (enable) {
      this.positionFeature = new Feature();

      this.accuracyFeature = this.locationLayer
        .getSource()
        ?.addFeatures([this.positionFeature, this.accuracyFeature]);

      this.trackAccuracy();
      this.trackPosition();
      this.handleError();
    }
  }

  private getLocationPoint(): Feature {
    const feature = new Feature();
    feature.setStyle(this.positionStyle);

    return feature;
  }

  private getAccuracyFeature(): Feature {
    const feature = new Feature();
    feature.setStyle(this.accuracyStyle);

    return feature;
  }

  /**
   * Remove all the events listeners.
   */
  private removeEventsListeners(): void {
    unByKey(this.featureAddTracker);
    unByKey(this.accuracyTracker);
    unByKey(this.positionTracker);
    unByKey(this.errorTracker);
  }
}

export default Location;
