import { Feature } from 'ol';
import { Interaction } from 'ol/interaction';
import { Fill, Stroke, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import Geolocation from 'ol/Geolocation.js';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { easeOut } from 'ol/easing';
import { Point } from 'ol/geom';

/**
 * This class add a location tracker to the map. The user
 */
class Location extends Interaction {
  public trackingEnabled = false;

  private positionFeature: Feature | undefined;
  private accuracyFeature: Feature | undefined;
  private hasZoomedToLocation = false;

  private geolocation = new Geolocation({
    trackingOptions: {
      enableHighAccuracy: true,
    },
    projection: this.getMap()?.getView().getProjection(),
  });

  private locationLayer = new VectorLayer({
    map: this.getMap() ?? undefined,
    source: new VectorSource(),
  });

  private positionStyle = new Style({
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

  private accuracyStyle = new Style({
    fill: new Fill({
      color: 'rgba(51, 153, 204, 0.5)',
    }),
  });

  constructor(
    interactionName: string,
    newPositionStyle?: Style,
    newAccuracyStyle?: Style
  ) {
    super();
    this.set('name', interactionName);
    if (newPositionStyle) this.positionStyle = newPositionStyle;
    if (newAccuracyStyle) this.accuracyStyle = newAccuracyStyle;
    this.trackAccuracy;
    this.trackPosition;
    this.addFeatureTracker;
  }

  private trackAccuracy = this.geolocation.on('change:accuracyGeometry', () => {
    const accuracy = this.geolocation.getAccuracyGeometry();
    this.accuracyFeature?.setGeometry(accuracy ? accuracy : undefined);
  });

  private trackPosition = this.geolocation.on('change:position', () => {
    const coordinates = this.geolocation.getPosition();
    if (coordinates) {
      const point = new Point(coordinates);
      this.positionFeature?.setGeometry(point);

      if (!this.hasZoomedToLocation) {
        const extent = point.getExtent();
        this.getMap()?.getView().fit(extent, {
          maxZoom: 18,
          duration: 500,
          easing: easeOut,
        });
        this.hasZoomedToLocation = true;
      }
    }
  });

  private addFeatureTracker = this.locationLayer
    .getSource()
    ?.on('addfeature', () => {
      const extent = this.positionFeature?.getGeometry()?.getExtent();
      console.log(extent);
      if (extent) this.getMap()?.getView().fit(extent);
    });

  public enableTracking(enable: boolean): void {
    this.geolocation.setTracking(enable);
    this.trackingEnabled = enable;

    if (enable) {
      this.locationLayer.getSource()?.clear();
      this.hasZoomedToLocation = false;
      console.log('ok');
    } else {
      console.log('cas else');
      this.accuracyFeature = new Feature();
      this.positionFeature = new Feature();

      this.positionFeature.setStyle(this.positionStyle);
      this.positionFeature.setStyle(this.accuracyStyle);

      this.locationLayer
        .getSource()
        ?.addFeatures([this.accuracyFeature, this.positionFeature]);
      this.hasZoomedToLocation = false;
    }
  }
}

export default Location;
