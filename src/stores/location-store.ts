// Map imports

import { defineStore } from 'pinia';
import { useMapStore } from './map-store';
import { Interactions } from 'src/enums/interactions.enum';
import { ref } from 'vue';
import Location, { LocationEventsType } from 'src/services/Location';

// Vue/Quasar imports

// Store imports

// Interface, type and enum imports

// Others imports

// script
enum TooltipMessage {
  ACTIVATE_LOCATION = 'Activate location',
  FIT_VIEW_TO_LOCATION = 'Fit the view to location',
  DEACTIVATE_LOCATION = 'Deactivate location',
}

enum LocationIcons {
  INACTIVE = 'sym_s_location_on',
  ACTIVE = 'location_on',
  LOCATION_ERROR = 'sym_s_location_off',
}

enum LocationColors {
  WHITE = 'rgba(222,255,255, 1)',
  ORANGE = 'rgba(255, 165, 0, 1)',
}

export const useLocationStore = defineStore('location', () => {
  const mas = useMapStore();
  const isLocationEnabled = ref(false);
  const islocationFound = ref(false);
  const isViewCentered = ref(false);
  const hasError = ref(false);

  const tooltipMessage = ref(TooltipMessage.ACTIVATE_LOCATION);
  const color = ref(LocationColors.WHITE);
  const icon = ref(LocationIcons.INACTIVE);

  const location = new Location(Interactions.LOCATION);
  mas.map.addInteraction(location);

  const locationFoundListener = location.on(
    // @ts-expect-error OL Event error.
    LocationEventsType.LOCATION_FOUND,
    () => {
      islocationFound.value = true;
      isViewCentered.value = true;
      icon.value = LocationIcons.ACTIVE;
      color.value = LocationColors.ORANGE;
    }
  );

  const viewModificationListener = location.on(
    // @ts-expect-error OL Event error.
    LocationEventsType.VIEW_MODIFICATION,
    () => {
      isViewCentered.value = false;
      tooltipMessage.value = TooltipMessage.FIT_VIEW_TO_LOCATION;
      icon.value = LocationIcons.ACTIVE;
      color.value = LocationColors.WHITE;
    }
  );

  const locationErrorListener = location.on(
    // @ts-expect-error OL Event error.
    LocationEventsType.LOCATION_ERROR,
    () => {
      hasError.value = true;
      icon.value = LocationIcons.LOCATION_ERROR;
      color.value = LocationColors.WHITE;
    }
  );

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

  function enableTracking() {
    location.enableTracking(true);
    isLocationEnabled.value = true;
    tooltipMessage.value = TOOLTIP_MESSAGE.DEACTIVATE_LOCATION;
    addListeners();
  }

  function disableTracking() {
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

  function fitView() {}

  function addListeners(): void {}

  function removeListeners(): void {}

  return {
    location,
  };
});
