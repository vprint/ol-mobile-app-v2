// Map imports

// Vue/Quasar imports
import { onMounted, Ref, ref, watch } from 'vue';
import { defineStore } from 'pinia';
import { RouteRecordName, useRoute, useRouter } from 'vue-router';

// Store imports

// Interface and enum imports

// Others imports
import _ from 'lodash';
import { useMapStore } from './map-store';
import { Feature } from 'ol';
import { SidePanelParameters } from 'src/enums/side-panel.enum';

export interface ISidePanelParameters {
  location: RouteRecordName | undefined;
  parameterName?: string;
  parameterValue?: string | string[];
}

/**
 * This store manage the right side panel and provide related functionnalities.
 */
export const useSidePanelStore = defineStore('sidePanel', () => {
  const mas = useMapStore();
  const router = useRouter();
  const route = useRoute();

  const isOpen = ref(false);
  const panelParameters: Ref<ISidePanelParameters> = ref({
    location: 'home',
  });

  /**
   * Read panel parameters from the url at startup
   */
  onMounted(() => {
    panelParameters.value = getSidePanelParametersFromRoute();
  });

  /**
   * This function analyze the route settings to set the panelParameters.
   */
  function getSidePanelParametersFromRoute(): ISidePanelParameters {
    const key = Object.keys(route.params)[0] as string | undefined;

    return {
      location: route.name ?? 'home',
      parameterName: key ?? undefined,
      parameterValue: key ? route.params[key] : undefined,
    };
  }

  /**
   * Open or close the side panel
   * @param active Should the side panel be opened or closed ?
   */
  function setActive(active: boolean, parameters?: ISidePanelParameters): void {
    if (!active) {
      router.push({ name: 'home' });

      panelParameters.value = {
        location: 'home',
      };
      if (isOpen.value) {
        setPanelPadding(false);
      }
    }

    // Open the side panel with the associated parameters
    else {
      if (parameters) {
        router.push({
          name: parameters.location,
          params:
            parameters.parameterName && parameters.parameterValue
              ? { [parameters.parameterName]: parameters.parameterValue }
              : undefined,
        });

        const url = router.resolve(route).href;
        window.history.replaceState(history.state, '', url);

        panelParameters.value = parameters;
        // If the the site panel is opened a custom panel padding is applied (see siteStore().updateMap())
        if (
          !isOpen.value &&
          panelParameters.value.location !== SidePanelParameters.SITE
        ) {
          setPanelPadding(true);
        }
      }
    }
    isOpen.value = active;
  }

  /**
   * Set the panel padding and zoom to the feature.
   * @param isOpen
   * @param feature
   * @param setZoom
   */
  function setPanelPadding(isOpen: boolean, feature?: Feature): void {
    const openPadding = [0, -400, 0, 0];
    const closePadding = [0, 0, 0, -400];
    mas.setPaddingAndExtent(isOpen ? openPadding : closePadding, feature);
  }

  /**
   * Watch for route change
   */
  watch(
    () => route.path,
    () => {
      const newPanelParameters = getSidePanelParametersFromRoute();
      if (!_.isEqual(newPanelParameters, panelParameters.value)) {
        panelParameters.value = newPanelParameters;
      }
    }
  );

  return {
    isOpen,
    panelParameters,
    setActive,
    setPanelPadding,
  };
});
