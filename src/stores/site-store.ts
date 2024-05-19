// Map imports

// Vue/Quasar imports
import { onMounted, Ref, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

// Store imports
import { defineStore } from 'pinia';

// Others imports
import ApiRequestor from 'src/services/ApiRequestor';
import { APP_PARAMS } from 'src/utils/params/appParams';
import { Site } from 'src/model/site';
import { ISite } from 'src/interface/ISite';

export const useSiteStore = defineStore('site', () => {
  const router = useRouter();
  const route = useRoute();

  const site: Ref<Site | undefined> = ref();

  /**
   * set site value
   * @param newSiteId
   */
  async function setSite(newSiteId: number): Promise<void> {
    site.value = await getSiteById(newSiteId);
    router.push({ name: 'site', params: { siteId: site.value?.siteId } });
  }

  /**
   * Get full site information by id
   * @param siteId SiteId
   * @returns
   */
  async function getSiteById(siteId: number): Promise<Site | undefined> {
    let site: Site | undefined = undefined;

    try {
      const result = await ApiRequestor.getJSON<ISite[]>(
        `${APP_PARAMS.featureServer}/functions/public.get_site_by_id/items.json?id=${siteId}`
      );

      if (result) {
        site = new Site(result[0]);
      }
    } catch (error) {
      console.error(`Error in getSiteById function : ${error}`);
    }

    return site;
  }

  /**
   * watch for site change in URL
   */
  watch(
    () => route.params.siteId,
    (newSiteId) => {
      if (newSiteId && parseInt(newSiteId as string) !== site.value?.siteId) {
        setSite(parseInt(newSiteId as string));
      } else {
        site.value = undefined;
      }
    }
  );

  /**
   * Initialize site
   */
  onMounted(async () => {
    setSite(parseInt(route.params.siteId as string));
  });

  return { site };
});
