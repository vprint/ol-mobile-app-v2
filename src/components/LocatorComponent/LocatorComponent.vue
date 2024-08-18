<script setup lang="ts">
// Vue/Quasar imports
import { storeToRefs } from 'pinia';
import { Ref, ref } from 'vue';

// Store imports
import { useMapStore } from 'src/stores/map-store';

// Map imports
import Map from 'ol/Map';
import Geolocation from 'ol/Geolocation.js';
import Feature from 'ol/Feature';
import { Fill, Stroke, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import Point from 'ol/geom/Point';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { easeOut } from 'ol/easing';

// Others imports

// Script
const { map } = storeToRefs(useMapStore());
const trackingEnabled = ref(false);
const accuracyFeature: Ref<Feature | undefined> = ref(undefined);
const positionFeature: Ref<Feature | undefined> = ref(undefined);
const hasZoomedToLocation = ref(false);

const positionStyle = new Style({
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

const accuracyStyle = new Style({
  fill: new Fill({
    color: 'rgba(51, 153, 204, 0.5)',
  }),
});

const geolocation = new Geolocation({
  trackingOptions: {
    enableHighAccuracy: true,
  },
  projection: map.value.getView().getProjection(),
});

const locationLayer = new VectorLayer({
  map: map.value as Map,
  source: new VectorSource(),
});

// TODO: Handle errors (via toast)

geolocation.on('change:accuracyGeometry', () => {
  const accuracy = geolocation.getAccuracyGeometry();
  accuracyFeature.value?.setGeometry(accuracy ? accuracy : undefined);
});

geolocation.on('change:position', () => {
  const coordinates = geolocation.getPosition();
  if (coordinates) {
    const point = new Point(coordinates);
    positionFeature.value?.setGeometry(point);

    if (!hasZoomedToLocation.value) {
      const extent = point.getExtent();
      map.value.getView().fit(extent, {
        maxZoom: 18,
        duration: 500,
        easing: easeOut,
      });
      hasZoomedToLocation.value = true;
    }
  }
});

locationLayer.getSource()?.on('addfeature', () => {
  const extent = positionFeature.value?.getGeometry()?.getExtent();
  if (extent) map.value.getView().fit(extent);
});

function enableTracking(): void {
  geolocation.setTracking(!trackingEnabled.value);
  trackingEnabled.value = !trackingEnabled.value;
  if (!trackingEnabled.value) {
    locationLayer.getSource()?.clear();
    hasZoomedToLocation.value = false;
  } else {
    accuracyFeature.value = new Feature();
    positionFeature.value = new Feature();

    positionFeature.value.setStyle(positionStyle);
    accuracyFeature.value.setStyle(accuracyStyle);

    locationLayer
      .getSource()
      ?.addFeatures([accuracyFeature.value, positionFeature.value]);
    hasZoomedToLocation.value = false;
  }
}
</script>

<template>
  <q-btn
    :flat="$q.platform.is.desktop"
    :fab="$q.platform.is.desktop"
    :round="$q.platform.is.mobile"
    :square="$q.platform.is.desktop"
    :color="$q.platform.is.mobile ? 'secondary' : undefined"
    :icon="trackingEnabled ? 'sym_s_location_off' : 'sym_s_location_on'"
    class="icon-weight-thin"
    :text-color="$q.platform.is.mobile ? 'primary' : undefined"
    @click="enableTracking"
  >
  </q-btn>
</template>
