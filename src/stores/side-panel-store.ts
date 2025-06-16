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
import { useSiteStore } from 'stores/site-store';

export interface ISidePanelParameters {
  location: RouteRecordName | undefined;
  parameterName?: string;
  parameterValue?: string | string[];
}

/**
 * This store manages the right side panel and provides related functionalities.
 */
export const useSidePanelStore = defineStore('sidePanel', () => {
  const mapStore = useMapStore();
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
   * This function analyzes the route settings to set the panelParameters.
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
   * Close the panel parameters
   */
  async function closePanel(): Promise<void> {
    _setPanelPadding(false);
    await router.push({ name: 'home' });
  }

  /**
   * Open the side panel with the given parameters
   * @param parameters - Panel parameters
   */
  async function openPanel(parameters: ISidePanelParameters): Promise<void> {
    if (!isOpen.value) _setPanelPadding(true);
    await _changeRoute(parameters);
  }

  async function _changeRoute(parameters: ISidePanelParameters): Promise<void> {
    await router.push({
      name: parameters.location,
      params:
        parameters.parameterName && parameters.parameterValue
          ? { [parameters.parameterName]: parameters.parameterValue }
          : undefined,
    });
  }

  /**
   * Set the panel padding and zoom to the feature.
   * @param shouldOpen - Should the panel be opened?
   */
  function _setPanelPadding(shouldOpen: boolean): void {
    const openPadding = [0, -400, 0, 0];
    const closePadding = [0, 0, 0, -400];

    mapStore.setPaddingAndExtent(
      shouldOpen ? openPadding : closePadding,
      useSiteStore().site
    );
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

      isOpen.value = newPanelParameters.location !== 'home';
    }
  );

  return {
    isOpen,
    panelParameters,
    openPanel,
    closePanel,
  };
});
