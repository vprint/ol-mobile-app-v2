// Map imports
import GeoJSON from 'ol/format/GeoJSON.js';
import { Feature } from 'ol';

// Vue/Quasar imports
import { onMounted, Ref, ref, watch } from 'vue';
import { defineStore, storeToRefs } from 'pinia';

// Store imports
import { useMapInteractionStore } from './map-interaction-store';
import { useSidePanelStore } from './side-panel-store';
import { useMapStore } from './map-store';

// Others imports
import ApiRequestor from 'src/services/ApiRequestor';
import {
  VectorTileSelectEvent,
  VectorTileSelectEventType,
} from 'src/plugins/VectorTileSelect';
import { Feature as GeoJSONFeature } from 'geojson';

// Enum / Interface imports
import { Site } from 'src/model/site';
import { SIDE_PANEL_PARAM } from 'src/utils/params/sidePanelParams';
import { ISite } from 'src/interface/ISite';

/**
 * Store sites and and related functionnalities
 */
export const useSiteStore = defineStore(SIDE_PANEL_PARAM.SITE, () => {
  const site: Ref<Site | undefined> = ref();
  const { selector, isMapInteractionsInitialized } = storeToRefs(
    useMapInteractionStore()
  );
  const { isActive, panelParameters } = storeToRefs(useSidePanelStore());
  const { setActive } = useSidePanelStore();
  const { fitMapToFeature, getLayerById } = useMapStore();
  const SITE_LAYER = 'archsites';

  /**
   * Main site-store function that allow to set the working site by it's id.
   * @param newSiteId
   */
  async function setSite(newSiteId: number): Promise<void> {
    setActive(true, {
      location: SIDE_PANEL_PARAM.SITE,
      parameterName: 'siteId',
      parameterValue: newSiteId.toString(),
    });
  }

  /**
   * Clear site in store and close widget
   */
  function clearSite(): void {
    site.value = undefined;
    selector.value?.clearFeatures();
    updateMap();
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
  async function setSiteById(siteId: number): Promise<Site | undefined> {
    const rawSite = await ApiRequestor.getSiteById(siteId);
    const feature = rawSite?.features[0];

    if (feature) {
      const newSite = new Site(feature.properties as ISite);

      if (panelParameters.value.parameterValue !== newSite.siteId.toString()) {
        setActive(true, {
          location: SIDE_PANEL_PARAM.SITE,
          parameterName: 'siteId',
          parameterValue: newSite.siteId.toString(),
        });
      }

      updateMap(feature);
      site.value = newSite;
      selector.value?.setFeaturesById([siteId.toString()]);
      return newSite;
    }
  }

  /**
   * Fit the map to the selected site and set the style.
   * @param geoJsonFeature Selected feature
   */
  function updateMap(geoJsonFeature?: GeoJSONFeature): void {
    if (geoJsonFeature) {
      const feature = new GeoJSON().readFeature(geoJsonFeature, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      }) as Feature;
      fitMapToFeature(feature);
    }

    const archLayer = getLayerById(SITE_LAYER);
    archLayer?.changed();
  }

  /**
   * This function listen to site selection and set the site.
   */
  function siteSelectionListener(): void {
    selector.value?.on(
      // @ts-expect-error - Type problems due to typescript / ol
      VectorTileSelectEventType.VECTOR_TILE_SELECT,
      (e: VectorTileSelectEvent) => {
        const features = e.selected;

        if (features && features.length > 0) {
          setSite(features[0].getId() as number);
          selector.value?.setFeaturesById([features[0].getId()?.toString()]);
        }
      }
    );
  }

  /**
   *
   * @param event the keyboard press envent
   */
  function handleEscape(event: KeyboardEvent): void {
    if (event.key === 'Escape' && isActive.value && site.value) {
      clearSite();
    }
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

    if (panelParameters.value.location === SIDE_PANEL_PARAM.SITE) {
      setSite(parseInt(panelParameters.value.parameterValue as string));
    }
  });

  return { site, setSite, updateSite, clearSite };
});
