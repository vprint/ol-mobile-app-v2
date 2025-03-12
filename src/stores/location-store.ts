// OL imports
import { EventsKey } from 'ol/events';
import { unByKey } from 'ol/Observable';

// Vue/Quasar imports
import { Ref, ref } from 'vue';

// Store imports
import { defineStore } from 'pinia';
import { useMapStore } from './map-store';

// Interface, type and enum imports
import { Interactions } from 'src/enums/interactions.enum';
import Location, { LocationEventsType } from 'src/services/Location';

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
  WHITE = 'rgba(255,255,255, 1)',
  ORANGE = 'rgba(255, 165, 0, 1)',
}

enum LocationStateMode {
  LOCATION_DISABLED = 'location:disabled',
  VIEW_CENTERED = 'view:centered',
  VIEW_UNCENTERED = 'view:uncentered',
}

export const useLocationStore = defineStore('location', () => {
  const mas = useMapStore();
  const isLocationEnabled = ref(false);
  const islocationFound = ref(false);
  const isViewCentered = ref(false);
  const hasError = ref(false);
  const locationMode: Ref<LocationStateMode | undefined> = ref(undefined);
  const tooltip = ref(TooltipMessage.ACTIVATE_LOCATION);
  const color = ref(LocationColors.WHITE);
  const icon = ref(LocationIcons.INACTIVE);

  const location = new Location({ interactionName: Interactions.LOCATION });
  mas.map.addInteraction(location);

  let locationFoundListener: EventsKey & EventsKey[];
  let viewModificationListener: EventsKey & EventsKey[];
  let locationErrorListener: EventsKey & EventsKey[];

  /**
   * Manage the user click according to the location state.
   */
  function manageUserClick(): void {
    const locationState = _getLocationState();
    switch (locationState) {
      case LocationStateMode.LOCATION_DISABLED:
        enableTracking();
        break;
      case LocationStateMode.VIEW_CENTERED:
        disableTracking();
        break;
      case LocationStateMode.VIEW_UNCENTERED:
        fitView();
        break;
    }
  }

  /**
   * Enable the geolocation tracking.
   */
  function enableTracking(): void {
    location.enableTracking(true);
    isLocationEnabled.value = true;
    tooltip.value = TooltipMessage.DEACTIVATE_LOCATION;
    _addListeners();
  }

  /**
   * Disable the geolocation tracking.
   */
  function disableTracking(): void {
    location.enableTracking(false);
    isLocationEnabled.value = false;
    islocationFound.value = false;
    isViewCentered.value = false;

    tooltip.value = TooltipMessage.ACTIVATE_LOCATION;
    icon.value = LocationIcons.INACTIVE;
    color.value = LocationColors.WHITE;

    _removeListeners();
  }

  /**
   * Fit the map view to the user location.
   */
  function fitView(): void {
    location.fitViewToLocation(location.addViewChangeListener);
    isViewCentered.value = true;
    tooltip.value = TooltipMessage.DEACTIVATE_LOCATION;
    icon.value = LocationIcons.ACTIVE;
    color.value = LocationColors.ORANGE;
  }

  /**
   * Add event listeners. Private.
   */
  function _addListeners(): void {
    locationFoundListener = _getLocationFoundListener();
    viewModificationListener = _getViewModificationListener();
    locationErrorListener = _getLocationErrorListener();
  }

  /**
   * Remove the events listenners. Private.
   */
  function _removeListeners(): void {
    unByKey(locationFoundListener);
    unByKey(viewModificationListener);
    unByKey(locationErrorListener);
  }

  /**
   * Get the location found listener. Private method.
   * @returns - The location found listener.
   */
  function _getLocationFoundListener(): EventsKey & EventsKey[] {
    return location.on(
      // @ts-expect-error OL Event error.
      LocationEventsType.LOCATION_FOUND,
      () => {
        islocationFound.value = true;
        isViewCentered.value = true;
        icon.value = LocationIcons.ACTIVE;
        color.value = LocationColors.ORANGE;
      }
    );
  }

  /**
   * Get the view modification listener. Private method.
   * @returns - The view modification listener.
   */
  function _getViewModificationListener(): EventsKey & EventsKey[] {
    return location.on(
      // @ts-expect-error OL Event error.
      LocationEventsType.VIEW_MODIFICATION,
      () => {
        isViewCentered.value = false;
        tooltip.value = TooltipMessage.FIT_VIEW_TO_LOCATION;
        icon.value = LocationIcons.ACTIVE;
        color.value = LocationColors.WHITE;
      }
    );
  }

  /**
   * Get the location error listener. Private method.
   * @returns - The location error listener.
   */
  function _getLocationErrorListener(): EventsKey & EventsKey[] {
    return location.on(
      // @ts-expect-error OL Event error.
      LocationEventsType.LOCATION_ERROR,
      () => {
        hasError.value = true;
        icon.value = LocationIcons.LOCATION_ERROR;
        color.value = LocationColors.WHITE;
      }
    );
  }

  /**
   * Get the location state mode. Private.
   * @returns - The location mode.
   */
  function _getLocationState(): LocationStateMode | undefined {
    locationMode.value = undefined;
    if (!isLocationEnabled.value) {
      locationMode.value = LocationStateMode.LOCATION_DISABLED;
    } else {
      if (isViewCentered.value && islocationFound.value) {
        locationMode.value = LocationStateMode.VIEW_CENTERED;
      }

      if (!isViewCentered.value && islocationFound.value) {
        locationMode.value = LocationStateMode.VIEW_UNCENTERED;
      }
    }
    return locationMode.value;
  }

  return {
    location,
    isViewCentered,
    isLocationEnabled,
    islocationFound,
    hasError,
    icon,
    tooltip,
    manageUserClick,
  };
});
