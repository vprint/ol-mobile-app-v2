// Map imports

// Vue/Quasar imports
import { onMounted, Ref, ref, watch } from 'vue';
import { defineStore, storeToRefs } from 'pinia';

// Store imports
import { useMapInteractionStore } from './map-interaction-store';
import { useSidePanelStore } from './side-panel-store';

// Others imports
import ApiRequestor from 'src/services/ApiRequestor';
import {
  VectorTileSelectEvent,
  VectorTileSelectEventType,
} from 'src/plugins/VectorTileSelect';

// Enum / Interface imports
import { APP_PARAMS } from 'src/utils/params/appParams';
import { Site } from 'src/model/site';
import { ISite } from 'src/interface/ISite';
import { SIDE_PANEL_PARAM } from 'src/utils/params/sidePanelParams';

/**
 * Store sites and and related functionnalities
 */
export const useSiteStore = defineStore(SIDE_PANEL_PARAM.SITE, () => {
  const site: Ref<Site | undefined> = ref();
  const { selector, isMapInteractionsInitialized } = storeToRefs(
    useMapInteractionStore()
  );
  const { panelParameters } = storeToRefs(useSidePanelStore());
  const { setActive } = useSidePanelStore();

  /**
   * Main site-store function that allow to set the working site by it's id.
   * @param newSiteId
   */
  async function setSite(newSiteId: number): Promise<void> {
    site.value = await getSiteById(newSiteId);
  }

  /**
   * Clear site in store and close widget
   */
  function clearSite(): void {
    site.value = undefined;
    setActive(false);
  }

  /**
   * Update site values. NewSite can be for exemple a modified clone of the original site.
   * @param site New site
   */
  function updateSite(newSite: Site): void {
    site.value = newSite;
  }

  /**
   * Get full site information by id
   * @param siteId SiteId
   * @returns
   */
  async function getSiteById(siteId: number): Promise<Site | undefined> {
    let site: Site | undefined = undefined;

    const result = await ApiRequestor.getJSON<ISite[]>(
      `${APP_PARAMS.featureServer}/functions/public.get_site_by_id/items.json?id=${siteId}`
    );

    if (result?.[0]) {
      site = new Site(result[0]);

      if (panelParameters.value.parameterValue !== site.siteId.toString()) {
        setActive(true, {
          location: SIDE_PANEL_PARAM.SITE,
          parameterName: 'siteId',
          parameterValue: site.siteId.toString(),
        });
      }
    }

    return site;
  }

  /**
   * This function listen to site selection and set the site.
   */
  function siteSelectionListener(): void {
    selector.value.on(
      // @ts-expect-error - Type problems due to typescript / ol
      VectorTileSelectEventType.VECTOR_TILE_SELECT,
      (e: VectorTileSelectEvent) => {
        const features = e.selected;

        if (features) {
          const sitesFeatures = features.filter(
            (feature) => feature.get('layer') === 'features'
          );

          if (sitesFeatures[0]) {
            setSite(sitesFeatures[0].getId() as number);
          }
        }
      }
    );
  }

  /**
   * watch for site change in URL
   */
  watch(
    () => panelParameters.value,
    (newPanelParameters) => {
      // Open site if URL contains site data
      if (
        newPanelParameters.location === SIDE_PANEL_PARAM.SITE &&
        newPanelParameters.parameterValue
      ) {
        const siteId = parseInt(
          newPanelParameters.parameterValue as string,
          10
        );

        if (siteId !== site.value?.siteId) {
          setSite(siteId);
        }
      }
      // Close site if URL does not contains site data
      else {
        site.value = undefined;
      }
    }
  );

  /**
   * Watch for interaction initialization
   * TODO: Voir si il est possible de supprimer immediate
   */
  watch(
    () => isMapInteractionsInitialized.value,
    () => {
      siteSelectionListener();
    },
    { immediate: true }
  );

  /**
   * Initialize site
   */
  onMounted(async () => {
    if (panelParameters.value.location === SIDE_PANEL_PARAM.SITE) {
      setSite(parseInt(panelParameters.value.parameterValue as string));
    }
  });

  return { site, setSite, updateSite, clearSite };
});
