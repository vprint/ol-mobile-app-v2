// Map imports

// Vue/Quasar imports
import { onMounted, Ref, ref, watch } from 'vue';
import { defineStore } from 'pinia';
import { RouteRecordName, useRoute, useRouter } from 'vue-router';

// Store imports

// Interface and enum imports

// Others imports

export interface ISidePanelParameters {
  location: RouteRecordName | undefined;
  parameterName?: string;
  parameterValue?: string | string[];
}

/**
 * This store manage map and provide related functionnalities.
 */
export const useSidePanelStore = defineStore('sidePanel', () => {
  const router = useRouter();
  const route = useRoute();

  const isActive = ref(false);
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
   * Set new side panel panel parameters
   * @param newPanelParameters Side panel parameters to set
   */
  function setSidePanelParameters(
    newPanelParameters: ISidePanelParameters
  ): void {
    panelParameters.value = newPanelParameters;
  }

  /**
   * Open or close the side panel
   * @param active Should the side panel be opened or closed ?
   */
  function setActive(active: boolean, parameters?: ISidePanelParameters): void {
    isActive.value = active;

    if (!active) {
      router.push({ name: 'home' });

      panelParameters.value = {
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

        panelParameters.value = parameters;
      }
    }
  }

  /**
   * Watch for route change
   */
  watch(
    () => route.path,
    () => {
      getSidePanelParametersFromRoute();
    }
  );

  return {
    isActive,
    panelParameters,
    setActive,
    setSidePanelParameters,
  };
});
