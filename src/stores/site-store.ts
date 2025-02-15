// Map imports
import GeoJSON from 'ol/format/GeoJSON.js';
import { Feature } from 'ol';

// Vue/Quasar imports
import { onMounted, Ref, ref, watch } from 'vue';
import { defineStore, storeToRefs } from 'pinia';

// Store imports
import { useMapInteractionStore } from './map-interaction-store';
import { useApiClientStore } from './api-client-store';
import { useSidePanelStore } from './side-panel-store';
import { useMapStore } from './map-store';

// Others imports
import {
  VectorTileSelectEvent,
  VectorTileSelectEventType,
} from 'src/services/VectorTileSelect';
import { Feature as GeoJSONFeature } from 'geojson';

// Enum / Interface imports
import { Site } from 'src/model/site';
import { SidePanelParameters } from 'src/enums/side-panel.enum';
import { SiteAttributes } from 'src/enums/site-type.enums';
import NewSite from 'src/model/newSite';

/**
 * Store sites and and related functionnalities
 */
export const useSiteStore = defineStore(SidePanelParameters.SITE, () => {
  const site: Ref<Site | undefined> = ref();
  const mis = useMapInteractionStore();
  const { isMapInteractionsInitialized } = storeToRefs(mis);
  const sps = useSidePanelStore();
  const mas = useMapStore();
  const SITE_LAYER = 'archsites';

  /**
   * Main site-store function that allow to set the working site by it's id.
   * @param newSiteId
   */
  async function openSitePanel(newSiteId: number): Promise<void> {
    sps.setActive(true, {
      location: SidePanelParameters.SITE,
      parameterName: 'siteId',
      parameterValue: newSiteId.toString(),
    });
  }

  /**
   * Close site panel and clear informations
   */
  function closeSitePanel(): void {
    clearSite();
    sps.setActive(false);
  }

  /**
   * Clear site values
   */
  function clearSite(): void {
    site.value = undefined;
    mis.selectorPlugin.clear();
    fitMap();
  }

  /**
   * Update site values. NewSite can be for exemple a modified clone of the original site.
   * @param site New site
   */
  function updateSite(newSite: Site): void {
    site.value = newSite;
  }

  /**
   * Request site information by id and open the panel
   * @param siteId SiteId
   * @returns
   */
  async function setSiteById(siteId: number): Promise<void> {
    const rawSite = await useApiClientStore().getSiteById(siteId);
    const feature = rawSite?.features[0];

    if (feature) {
      const test = new NewSite(feature);
      console.log(test.attributes.alternativeName);
      // TODO: Continuer de travailler ici
      console.log(test, 'Feature de test');
      const newSite = new Site(feature);

      if (
        sps.panelParameters.parameterValue !==
        newSite.get(SiteAttributes.SITE_ID).toString()
      ) {
        openSitePanel(newSite.get(SiteAttributes.SITE_ID));
      }

      fitMap(feature);
      site.value = newSite;
      mis.selectorPlugin.setAsSelected([siteId.toString()]);
    }
  }

  /**
   * Fit the map to the selected site and set the style.
   * @param geoJsonFeature Selected feature
   */
  function fitMap(geoJsonFeature?: GeoJSONFeature): void {
    if (geoJsonFeature) {
      const feature = new GeoJSON().readFeature(geoJsonFeature, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      }) as Feature;
      sps.setPanelPadding(true, feature);
    }

    const archLayer = mas.getLayerById(SITE_LAYER);
    archLayer?.changed();
  }

  /**
   * This function listen to site selection and set the site.
   */
  function siteSelectionListener(): void {
    mis.selectorPlugin.on(
      // @ts-expect-error type error
      VectorTileSelectEventType.VECTOR_TILE_SELECT,
      (e: VectorTileSelectEvent) => {
        const features = e.selected;

        if (features && features.length > 0) {
          openSitePanel(features[0].getId() as number);
          mis.selectorPlugin.setAsSelected([features[0].getId()?.toString()]);
        }
      }
    );
  }

  /**
   *
   * @param event the keyboard press envent
   */
  function handleEscape(event: KeyboardEvent): void {
    if (event.key === 'Escape' && sps.isOpen && site.value) {
      closeSitePanel();
    }
  }

  /**
   * watch for site change in URL
   */
  watch(
    () => sps.panelParameters,
    (newPanelParameters) => {
      // Open site if URL contains site data
      if (
        newPanelParameters.location === SidePanelParameters.SITE &&
        newPanelParameters.parameterValue
      ) {
        const siteId = parseInt(
          newPanelParameters.parameterValue as string,
          10
        );
        if (siteId !== site.value?.get(SiteAttributes.SITE_ID)) {
          setSiteById(siteId);
        }
      } else {
        clearSite();
      }
    }
  );

  /**
   * Watch for interaction initialization
   */
  watch(
    () => isMapInteractionsInitialized.value,
    (newValue) => {
      if (newValue) {
        siteSelectionListener();
      }
    },
    { immediate: true }
  );

  /**
   * Initialize site
   */
  onMounted(async () => {
    window.addEventListener('keydown', handleEscape);

    if (sps.panelParameters.location === SidePanelParameters.SITE) {
      openSitePanel(parseInt(sps.panelParameters.parameterValue as string));
    }
  });

  return { site, openSitePanel, updateSite, closeSitePanel };
});
