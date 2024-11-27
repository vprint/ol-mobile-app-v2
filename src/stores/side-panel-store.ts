// Map imports

// Vue/Quasar imports
import { onMounted, ref, watch } from 'vue';
import { defineStore } from 'pinia';
import { RouteRecordName, useRoute, useRouter } from 'vue-router';

// Store imports

// Interface and enum imports

// Others imports
import _ from 'lodash';

export interface ISidePanelParameters {
  location: RouteRecordName | undefined;
  parameterName?: string;
  parameterValue?: string | string[];
}

/**
 * This store manage the right side panel and provide related functionnalities.
 */
export const useSidePanelStore = defineStore('sidePanel', () => {
  const router = useRouter();
  const route = useRoute();

  const isActive = ref(false);
  let panelParameters: ISidePanelParameters = {
    location: 'home',
  };

  /**
   * Read panel parameters from the url at startup
   */
  onMounted(() => {
    panelParameters = getSidePanelParametersFromRoute();
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
    isActive.value = active;

    if (!active) {
      router.push({ name: 'home' });

      panelParameters = {
        location: 'home',
      };
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

        panelParameters = parameters;
      }
    }
  }

  /**
   * Watch for route change
   */
  watch(
    () => route.path,
    () => {
      const newPanelParameters = getSidePanelParametersFromRoute();
      if (!_.isEqual(newPanelParameters, panelParameters)) {
        Object.assign(panelParameters, newPanelParameters);
      }
    }
  );

  return {
    isActive,
    panelParameters,
    setActive,
  };
});
