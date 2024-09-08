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
 * This store manage the right side panel and provide related functionnalities.
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
    console.log('useSidePanelStore().onMounted');
    panelParameters.value = getSidePanelParametersFromRoute();
  });

  /**
   * This function analyze the route settings to set the panelParameters.
   */
  function getSidePanelParametersFromRoute(): ISidePanelParameters {
    console.log('useSidePanelStore().getSidePanelParametersFromRoute');
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
    console.log('useSidePanelStore().setActive');
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

        const url = router.resolve(route).href;
        window.history.replaceState({}, '', url);

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
      console.log('useSidePanelStore().watchRoutePath');
      panelParameters.value = getSidePanelParametersFromRoute();
    }
  );

  return {
    isActive,
    panelParameters,
    setActive,
  };
});
