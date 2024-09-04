<script setup lang="ts">
// Vue/Quasar imports
import { ref } from 'vue';

// Store imports
import { useMapStore } from 'src/stores/map-store';

// Map imports

// Others imports
import Location, { LocationEventsType } from 'src/plugins/Location';
import { INTERACTIONS_PARAMS } from 'src/utils/params/interactionsParams';
import { storeToRefs } from 'pinia';
import { EventsKey } from 'ol/events';
import { unByKey } from 'ol/Observable';

// Script
enum TOOLTIP_MESSAGE {
  ACTIVATE_LOCATION = 'Activate location',
  FIT_VIEW_TO_LOCATION = 'Fit the view to location',
  DEACTIVATE_LOCATION = 'Deactivate location',
}

const { map } = storeToRefs(useMapStore());
const isLocationEnabled = ref(false);
const islocationFound = ref(false);
const isViewCentered = ref(false);
const tooltipMessage = ref(TOOLTIP_MESSAGE.ACTIVATE_LOCATION);

let locationFoundListener: (EventsKey & EventsKey[]) | undefined;
let viewModificationListener: (EventsKey & EventsKey[]) | undefined;

const location = new Location(INTERACTIONS_PARAMS.location);
map.value.addInteraction(location);

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
    }
  );

  viewModificationListener = location.on(
    // @ts-expect-error OL Event error.
    LocationEventsType.VIEW_MODIFICATION,
    () => {
      isViewCentered.value = false;
      tooltipMessage.value = TOOLTIP_MESSAGE.FIT_VIEW_TO_LOCATION;
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
  if (locationFoundListener && viewModificationListener) {
    unByKey(locationFoundListener);
    unByKey(viewModificationListener);
  }
  tooltipMessage.value = TOOLTIP_MESSAGE.ACTIVATE_LOCATION;
}

/**
 * Fit the view to the location extent
 */
function fitView(): void {
  location.fitViewToLocation(location.addViewChangeListener);
  isViewCentered.value = true;
  tooltipMessage.value = TOOLTIP_MESSAGE.DEACTIVATE_LOCATION;
}
</script>

<template>
  <q-btn
    flat
    fab
    square
    :color="
      isViewCentered && isLocationEnabled && islocationFound
        ? 'orange'
        : 'primary'
    "
    :loading="isLocationEnabled && !islocationFound"
    :icon="
      isLocationEnabled && islocationFound ? 'location_on' : 'sym_s_location_on'
    "
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
