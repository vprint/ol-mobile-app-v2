// Map imports

// Vue/Quasar imports
import { onMounted, Ref, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

// Store imports
import { defineStore, storeToRefs } from 'pinia';

// Others imports
import ApiRequestor from 'src/services/ApiRequestor';
import { APP_PARAMS } from 'src/utils/params/appParams';
import { Site } from 'src/model/site';
import { ISite } from 'src/interface/ISite';
import { useMapInteractionStore } from './map-interaction-store';
import { FeatureLike } from 'ol/Feature';
/**
 * Store sites and and related functionnalities
 */
export const useSiteStore = defineStore('site', () => {
  const router = useRouter();
  const route = useRoute();

  const site: Ref<Site | undefined> = ref();
  const { selector, isMapInteractionsInitialized } = storeToRefs(
    useMapInteractionStore()
  );

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
    router.push({ name: 'home' });
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
      router.push({ name: 'site', params: { siteId: site.siteId } });
    }

    return site;
  }

  /**
   * This function listen to site selection and set the site.
   */
  function siteSelectionListener(): void {
    //@ts-expect-error - Erreur de typage. Ticket ouvert : https://stackoverflow.com/questions/78657272/custom-event-listener-in-openlayers
    selector.value.on('select:vectortile', (e: unknown) => {
      const features = e.selected as FeatureLike[] | undefined;

      if (features) {
        const sitesFeatures = features.filter(
          (feature) => feature.get('layer') === 'sites'
        );

        if (sitesFeatures[0]) {
          setSite(sitesFeatures[0].getId() as number);
        }
      }
    });
  }

  /**
   * watch for site change in URL
   */
  watch(
    () => route.params.siteId,
    (newSiteId) => {
      if (newSiteId && parseInt(newSiteId as string) !== site.value?.siteId) {
        setSite(parseInt(newSiteId as string));
      } else if (!newSiteId) {
        site.value = undefined;
      }
    }
  );

  /**
   * Watch for interaction initialization
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
    setSite(parseInt(route.params.siteId as string));
  });

  return { site, setSite, updateSite, clearSite };
});
