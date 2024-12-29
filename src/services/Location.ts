import { Feature, Map } from 'ol';
import { Interaction } from 'ol/interaction';
import { Fill, Stroke, Style } from 'ol/style';
import { easeOut } from 'ol/easing';
import { Point } from 'ol/geom';
import { EventsKey } from 'ol/events';
import { unByKey } from 'ol/Observable';
import Event from 'ol/events/Event.js';
import CircleStyle from 'ol/style/Circle';
import Geolocation from 'ol/Geolocation.js';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

/**
 * Location events.
 */
export enum LocationEventsType {
  LOCATION_FOUND = 'location:found',
  LOCATION_ERROR = 'location:error',
  VIEW_MODIFICATION = 'location:view-modification',
}

enum LocationParameters {
  ANIMATION_DURATION = 500,
  MAX_ZOOM = 15,
}

enum LocationStyle {
  POSITION_COLOR = 'rgb(51, 153, 204)',
  POSITION_HIGHLIGHT = 'rgba(255,255,255,1)',
  ACCURACY_STYLE = 'rgba(51, 153, 204, 0.2)',
}

enum GeolocationEvents {
  ERROR = 'error',
  POSITION_CHANGE = 'change:position',
  ACCURACY_CHANGE = 'change:accuracyGeometry',
  VIEW_CHANGE = 'change',
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
  private positionFeature: Feature | undefined;
  private accuracyFeature: Feature | undefined;
  private locationLayer: VectorLayer;
  private positionStyle: Style;
  private accuracyStyle: Style;
  private isViewCentered = false;
  private isLocationFound = false;
  private geolocation: Geolocation;
  private viewChangeListener!: EventsKey;
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
    this.locationLayer = this.getLocationLayer();
    this.positionStyle = newPositionStyle ?? this.getPositionStyle();
    this.accuracyStyle = newAccuracyStyle ?? this.getAccuracyStyle();
    this.geolocation = this.getGeolocation();
  }

  /**
   * Initialize component.
   * @param map - OpenLayers map.
   */
  public setMap(map: Map | null): void {
    super.setMap(map);
    this.geolocation.setProjection(this.getMap()?.getView().getProjection());
    this.getMap()?.addLayer(this.locationLayer);
  }

  /**
   * Throw an error event an log the error.
   */
  private addErrorHandler(): void {
    this.errorTracker = this.geolocation.on(
      GeolocationEvents.ERROR,
      (error) => {
        console.error(error);
        this.dispatchEvent(
          new LocationEvents(LocationEventsType.LOCATION_ERROR)
        );
      }
    );
  }

  /**
   * Track accuracy change and update the accuracy geometry.
   */
  private addAccuracyTracker(): void {
    this.accuracyTracker = this.geolocation.on(
      GeolocationEvents.ACCURACY_CHANGE,
      () => {
        const accuracy = this.geolocation.getAccuracyGeometry();
        this.accuracyFeature?.setGeometry(accuracy ? accuracy : undefined);
      }
    );
  }

  /**
   * Track position change and update position geometry.
   */
  private addPositionTracker(): void {
    this.positionTracker = this.geolocation.on(
      GeolocationEvents.POSITION_CHANGE,
      () => {
        const coordinates = this.geolocation.getPosition();
        if (coordinates) {
          const point = new Point(coordinates);
          this.positionFeature?.setGeometry(point);

          if (!this.isLocationFound) {
            this.fitViewToLocation(this.onLocationFound());
          }
        }
      }
    );
  }

  /**
   * Get the location found callback.
   * @returns - The callback.
   */
  private onLocationFound(): () => void {
    return (): void => {
      this.isLocationFound = true;
      this.dispatchEvent(new LocationEvents(LocationEventsType.LOCATION_FOUND));
      this.addViewChangeListener();
      this.isViewCentered = true;
    };
  }

  /**
   * Manage the map view change and throw a view change event.
   */
  public addViewChangeListener = (): void => {
    const map = this.getMap();

    if (map) {
      this.viewChangeListener = map
        .getView()
        .once(GeolocationEvents.VIEW_CHANGE, (): void => {
          this.isViewCentered = false;
          this.dispatchEvent(
            new LocationEvents(LocationEventsType.VIEW_MODIFICATION)
          );
        });
    }
  };

  /**
   * Fit the map view to the location extent and execute a callback if necessary.
   * @param callback Function to execute after the map fit.
   */
  public fitViewToLocation(callback?: () => void): void {
    const extent = this.accuracyFeature?.getGeometry()?.getExtent();

    if (extent) {
      this.getMap()
        ?.getView()
        .fit(extent, {
          maxZoom: LocationParameters.MAX_ZOOM,
          duration: LocationParameters.ANIMATION_DURATION,
          easing: easeOut,
          callback: callback ? callback : undefined,
        });
    }
  }

  /**
   * Set the tracking active.
   * @param enable - enable / disable the tracking.
   */
  public setActive(enable: boolean): void {
    super.setActive(enable);
    this.reset();

    this.geolocation.setTracking(enable);

    if (enable) {
      this.addLocationFeatures();
      this.addEventsListeners();
    }
  }

  /**
   * Extract the location point and the accuracy
   * feature and add it to the location layer.
   */
  private addLocationFeatures(): void {
    this.positionFeature = this.getLocationPoint();
    this.accuracyFeature = this.getAccuracyFeature();

    this.locationLayer
      .getSource()
      ?.addFeatures([this.positionFeature, this.accuracyFeature]);
  }

  /**
   * Get the position style.
   * @returns - The position style.
   */
  private getPositionStyle(): Style {
    return new Style({
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({
          color: LocationStyle.POSITION_COLOR,
        }),
        stroke: new Stroke({
          color: LocationStyle.POSITION_HIGHLIGHT,
          width: 2,
        }),
      }),
    });
  }

  /**
   * Get the accuracy style.
   * @returns - The accuracy style.
   */
  private getAccuracyStyle(): Style {
    return new Style({
      fill: new Fill({
        color: LocationStyle.ACCURACY_STYLE,
      }),
    });
  }

  /**
   * Get the OL geolocation class.
   * @returns - The new geolocation.
   */
  private getGeolocation(): Geolocation {
    return new Geolocation({
      trackingOptions: {
        enableHighAccuracy: true,
      },
      projection: this.getMap()?.getView().getProjection(),
    });
  }

  /**
   * Get the location point with the associated style.
   * @returns - The location point.
   */
  private getLocationPoint(): Feature {
    const feature = new Feature();
    feature.setStyle(this.positionStyle);
    return feature;
  }

  /**
   * Get the accuracy feature.
   * @returns - The accuracy feature (a cricle representing the accuracy).
   */
  private getAccuracyFeature(): Feature {
    const feature = new Feature();
    feature.setStyle(this.accuracyStyle);
    return feature;
  }

  /**
   * Add location events listeners.
   */
  private addEventsListeners(): void {
    this.addAccuracyTracker();
    this.addPositionTracker();
    this.addErrorHandler();
  }

  /**
   * Remove all location events listeners.
   */
  private removeEventsListeners(): void {
    unByKey(this.viewChangeListener);
    unByKey(this.accuracyTracker);
    unByKey(this.positionTracker);
    unByKey(this.errorTracker);
  }

  /**
   * Get the location layers used to show location.
   * @returns - The location layer.
   */
  private getLocationLayer(): VectorLayer {
    return new VectorLayer({
      source: new VectorSource(),
      zIndex: Infinity,
    });
  }

  /**
   * Reset location parameters.
   */
  private reset(): void {
    this.locationLayer.getSource()?.clear();
    this.isLocationFound = false;
    this.removeEventsListeners();
  }
}

export default Location;
