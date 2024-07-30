// Map imports

// Vue/Quasar imports
import { onMounted, Ref, ref } from 'vue';
import { defineStore } from 'pinia';
import { RouteRecordName, useRoute, useRouter } from 'vue-router';

// Store imports

// Interface and enum imports

// Others imports

export interface ISidePanelParameters {
  location: RouteRecordName;
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
   * Open or close the side panel
   * @param active Should the side panel be opened or closed ?
   */
  function setActive(active: boolean, parameters?: ISidePanelParameters): void {
    isActive.value = active;

    // close the side panel
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

  onMounted(() => {
    const key = Object.keys(route.params)[0] as string | undefined;

    panelParameters.value = {
      location: route.name ?? 'home',
      parameterName: key ?? undefined,
      parameterValue: key ? route.params[key] : undefined,
    };
  });

  return {
    isActive,
    panelParameters,
    setActive,
  };
});

/*
1) fonction pour ouvrir le panel
2) fonction de lecture de l'url (pour savoir si le panel doit être ouvert ou non au démarrage)
3) Fonction de gestion des données dans l'url (je pense qu'il s'agirat simplement de la string à recevoir)
*/
