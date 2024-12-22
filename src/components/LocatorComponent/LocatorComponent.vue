<script setup lang="ts">
// Vue/Quasar imports
import { ref } from 'vue';

// Store imports
import { useMapStore } from 'src/stores/map-store';

// Map imports

// Others imports
import Location, { LocationEventsType } from 'src/services/Location';
import { Interactions } from 'src/enums/interactions.enum';
import { EventsKey } from 'ol/events';
import { unByKey } from 'ol/Observable';

// Script
enum TOOLTIP_MESSAGE {
  ACTIVATE_LOCATION = 'Activate location',
  FIT_VIEW_TO_LOCATION = 'Fit the view to location',
  DEACTIVATE_LOCATION = 'Deactivate location',
}

const mas = useMapStore();
const isLocationEnabled = ref(false);
const islocationFound = ref(false);
const isViewCentered = ref(false);
const hasError = ref(false);
const tooltipMessage = ref(TOOLTIP_MESSAGE.ACTIVATE_LOCATION);
const color = ref('white');
const icon = ref('sym_s_location_on');

let locationFoundListener: (EventsKey & EventsKey[]) | undefined;
let viewModificationListener: (EventsKey & EventsKey[]) | undefined;
let locationErrorListener: (EventsKey & EventsKey[]) | undefined;

const location = new Location(Interactions.LOCATION);
mas.map.addInteraction(location);

/**
 * Manage the location process
 */
function manageLocation(): void {
  if (!isLocationEnabled.value) {
    enableTracking();
  } else {
    if (isViewCentered.value && islocationFound.value) {
      disableTracking();
    }

    if (!isViewCentered.value && islocationFound.value) {
      fitView();
    }
  }
}

/**
 * Enable the tracking
 */
function enableTracking(): void {
  location.enableTracking(true);
  isLocationEnabled.value = true;
  tooltipMessage.value = TOOLTIP_MESSAGE.DEACTIVATE_LOCATION;

  locationFoundListener = location.on(
    // @ts-expect-error OL Event error.
    LocationEventsType.LOCATION_FOUND,
    () => {
      islocationFound.value = true;
      isViewCentered.value = true;
      icon.value = 'location_on';
      color.value = 'orange';
    }
  );

  viewModificationListener = location.on(
    // @ts-expect-error OL Event error.
    LocationEventsType.VIEW_MODIFICATION,
    () => {
      isViewCentered.value = false;
      tooltipMessage.value = TOOLTIP_MESSAGE.FIT_VIEW_TO_LOCATION;
      icon.value = 'location_on';
      color.value = 'white';
    }
  );

  locationErrorListener = location.on(
    // @ts-expect-error OL Event error.
    LocationEventsType.LOCATION_ERROR,
    () => {
      hasError.value = true;
      icon.value = 'sym_s_location_off';
      color.value = 'white';
    }
  );
}

/**
 * Disable tracking, reset the component variables and clear the event listener
 */
function disableTracking(): void {
  location.enableTracking(false);
  isLocationEnabled.value = false;
  islocationFound.value = false;
  isViewCentered.value = false;

  if (locationFoundListener) unByKey(locationFoundListener);
  if (viewModificationListener) unByKey(viewModificationListener);
  if (locationErrorListener) unByKey(locationErrorListener);

  tooltipMessage.value = TOOLTIP_MESSAGE.ACTIVATE_LOCATION;
  icon.value = 'sym_s_location_on';
  color.value = 'white';
}

/**
 * Fit the view to the location extent
 */
function fitView(): void {
  location.fitViewToLocation(location.addViewChangeListener);
  isViewCentered.value = true;
  tooltipMessage.value = TOOLTIP_MESSAGE.DEACTIVATE_LOCATION;
  icon.value = 'location_on';
  color.value = 'orange';
}
</script>

<template>
  <q-btn
    unelevated
    :loading="isLocationEnabled && !islocationFound && !hasError"
    :icon="icon"
    :disable="hasError"
    :class="{
      'app-button btn--no-hover': true,
      'is-active': isLocationEnabled,
      'is-found': isViewCentered,
    }"
    @click="manageLocation()"
  >
    <q-tooltip
      anchor="bottom middle"
      self="bottom middle"
      transition-show="scale"
      transition-hide="scale"
      :offset="[0, 40]"
      :delay="1000"
      style="border-radius: 0"
    >
      {{ tooltipMessage }}
    </q-tooltip>
  </q-btn>
</template>

<style lang="scss" scoped>
.app-button {
  &.is-found {
    color: $orange;
  }
}
</style>
