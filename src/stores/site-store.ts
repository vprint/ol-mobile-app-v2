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
  const { panelParameters } = storeToRefs(useSidePanelStore());
  const { setActive } = useSidePanelStore();
  const { fitMapToFeature, getLayerById } = useMapStore();

  /**
   * Main site-store function that allow to set the working site by it's id.
   * @param newSiteId
   */
  async function setSite(newSiteId: number): Promise<void> {
    console.log('siteStore().setSite');
    site.value = await setSiteById(newSiteId);
  }

  /**
   * Clear site in store and close widget
   */
  function clearSite(): void {
    console.log('siteStore().clearSite');
    site.value = undefined;
    updateMap();
  }

  /**
   * Update site values. NewSite can be for exemple a modified clone of the original site.
   * @param site New site
   */
  function updateSite(newSite: Site): void {
    console.log('siteStore().updateSite');
    site.value = newSite;
  }

  /**
   * Request site information by id and open the panel
   * @param siteId SiteId
   * @returns
   */
  async function setSiteById(siteId: number): Promise<Site | undefined> {
    console.log('siteStore().setSiteById');
    const rawSite = await ApiRequestor.getSiteById(siteId);
    const feature = rawSite?.features[0];

    if (feature) {
      const site = new Site(feature.properties as ISite);

      if (panelParameters.value.parameterValue !== site.siteId.toString()) {
        setActive(true, {
          location: SIDE_PANEL_PARAM.SITE,
          parameterName: 'siteId',
          parameterValue: site.siteId.toString(),
        });
      }

      updateMap(feature);
      return site;
    }
  }

  /**
   * Fit the map to the selected site and set the style.
   * @param geoJsonFeature Selected feature
   */
  function updateMap(geoJsonFeature?: GeoJSONFeature): void {
    console.log('siteStore().updateMap');
    const archLayer = getLayerById('archsites');

    if (geoJsonFeature) {
      const feature = new GeoJSON().readFeature(geoJsonFeature, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      }) as Feature;
      fitMapToFeature(feature);
      archLayer?.set('selectedFeature', feature.get('siteId'));
    } else {
      archLayer?.set('selectedFeature', undefined);
    }
    archLayer?.changed();
  }

  /**
   * This function listen to site selection and set the site.
   */
  function siteSelectionListener(): void {
    selector.value.on(
      // @ts-expect-error - Type problems due to typescript / ol
      VectorTileSelectEventType.VECTOR_TILE_SELECT,
      (e: VectorTileSelectEvent) => {
        console.log('siteStore().siteSelectionListener');
        const features = e.selected;

        if (features) {
          const sitesFeatures = features.filter(
            (feature) => feature.get('layer') === 'archsites'
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
    () => {
      console.log('siteStore().WatcherIsMapInteractionsInitialized');
      siteSelectionListener();
    },
    { immediate: true }
  );

  /**
   * Initialize site
   */
  onMounted(async () => {
    console.log('siteStore().onMounted');
    if (panelParameters.value.location === SIDE_PANEL_PARAM.SITE) {
      setSite(parseInt(panelParameters.value.parameterValue as string));
    }
  });

  return { site, setSite, updateSite, clearSite };
});
