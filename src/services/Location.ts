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
import { InteractionSettings } from 'src/enums/map.enum';

/**
 * Location events.
 */
export enum LocationEventsType {
  LOCATION_FOUND = 'location:found',
  LOCATION_ERROR = 'location:error',
  VIEW_MODIFICATION = 'location:view-modification',
}

enum GeolocationEvents {
  ERROR = 'error',
  POSITION_CHANGE = 'change:position',
  ACCURACY_CHANGE = 'change:accuracyGeometry',
  VIEW_CHANGE = 'change',
}

enum LocationParameters {
  ANIMATION_DURATION = 500,
  MAX_ZOOM = 15,
}

enum LocationColors {
  POSITION_COLOR = 'rgb(51, 153, 204)',
  POSITION_HIGHLIGHT = 'rgba(255,255,255,1)',
  ACCURACY_STYLE = 'rgba(51, 153, 204, 0.2)',
}

interface ILocationStyle {
  position: Style;
  accuracy: Style;
}

interface ILocationFeatures {
  position: Feature;
  accuracy: Feature;
}

interface IOptions {
  interactionName: string;
  positionStyle?: Style;
  accuracyStyle?: Style;
}

interface IEventsListeners {
  view?: EventsKey | EventsKey[];
  accuracy?: EventsKey | EventsKey[];
  position?: EventsKey | EventsKey[];
  error?: EventsKey | EventsKey[];
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
  private readonly features: ILocationFeatures;
  private readonly locationLayer: VectorLayer;
  private readonly geolocation: Geolocation;
  private readonly style: ILocationStyle;
  private eventListeners: IEventsListeners = {};

  private state = {
    isViewCentered: false,
    isLocationFound: false,
  };

  constructor(options: IOptions) {
    super();
    this.set(InteractionSettings.NAME, options.interactionName);

    this.style = {
      position: options.positionStyle ?? this.getPositionStyle(),
      accuracy: options.accuracyStyle ?? this.getAccuracyStyle(),
    };

    this.features = {
      position: this.getLocationPoint(),
      accuracy: this.getAccuracyFeature(),
    };

    this.locationLayer = this.getLocationLayer();
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
   * Throw an error event and log the error.
   */
  private getErrorHandler(): EventsKey | EventsKey[] {
    return this.geolocation.on(GeolocationEvents.ERROR, (error) => {
      console.error(error);
      this.dispatchEvent(new LocationEvents(LocationEventsType.LOCATION_ERROR));
    });
  }

  /**
   * Track accuracy change and update the accuracy geometry.
   */
  private getAccuracyTracker(): EventsKey | EventsKey[] {
    return this.geolocation.on(GeolocationEvents.ACCURACY_CHANGE, () => {
      const accuracy = this.geolocation.getAccuracyGeometry();
      this.features.accuracy.setGeometry(accuracy ?? undefined);
    });
  }

  /**
   * Track position change and update position geometry.
   */
  private getPositionTracker(): EventsKey | EventsKey[] {
    return this.geolocation.on(GeolocationEvents.POSITION_CHANGE, () => {
      const coordinates = this.geolocation.getPosition();

      if (coordinates) {
        const point = new Point(coordinates);
        this.features.position.setGeometry(point);
        if (!this.state.isLocationFound) {
          this.handleLocationFound();
        }
      }
    });
  }

  /**
   * Handle the user location found event.
   */
  private handleLocationFound(): void {
    this.fitViewToLocation(() => {
      this.state.isLocationFound = true;
      this.dispatchEvent(new LocationEvents(LocationEventsType.LOCATION_FOUND));
      this.addViewChangeListener();
      this.state.isViewCentered = true;
    });
  }

  /**
   * Manage the map view change and throw a view change event.
   */
  public addViewChangeListener = (): void => {
    const map = this.getMap();
    if (map) {
      this.eventListeners.view = map
        .getView()
        .once(GeolocationEvents.VIEW_CHANGE, (): void => {
          this.state.isViewCentered = false;
          this.dispatchEvent(
            new LocationEvents(LocationEventsType.VIEW_MODIFICATION)
          );
        });
    }
  };

  /**
   * Fit the map view to the location extent and execute a callback if necessary.
   * @param callback - Function to execute after the map fit.
   */
  public fitViewToLocation(callback?: () => void): void {
    const extent = this.features.accuracy.getGeometry()?.getExtent();

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
  public enableTracking(enable: boolean): void {
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
    this.features.position = this.getLocationPoint();
    this.features.accuracy = this.getAccuracyFeature();

    this.locationLayer
      .getSource()
      ?.addFeatures([this.features.position, this.features.accuracy]);
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
          color: LocationColors.POSITION_COLOR,
        }),
        stroke: new Stroke({
          color: LocationColors.POSITION_HIGHLIGHT,
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
        color: LocationColors.ACCURACY_STYLE,
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
    feature.setStyle(this.style.position);
    return feature;
  }

  /**
   * Get the accuracy feature.
   * @returns - The accuracy feature (a cricle representing the accuracy).
   */
  private getAccuracyFeature(): Feature {
    const feature = new Feature();
    feature.setStyle(this.style.accuracy);
    return feature;
  }

  /**
   * Add location events listeners.
   */
  private addEventsListeners(): void {
    this.eventListeners.accuracy = this.getAccuracyTracker();
    this.eventListeners.position = this.getPositionTracker();
    this.eventListeners.error = this.getErrorHandler();
  }

  /**
   * Remove all location events listeners.
   */
  private removeEventsListeners(): void {
    Object.values(this.eventListeners).forEach((listener) => {
      unByKey(listener);
    });
    this.eventListeners = {};
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
    this.state.isLocationFound = false;
    this.removeEventsListeners();
  }
}

export default Location;
