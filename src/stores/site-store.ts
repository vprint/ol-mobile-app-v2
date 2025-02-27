// Map imports
import { Feature } from 'ol';
import GeoJSON from 'ol/format/GeoJSON.js';

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

// Enum / Interface / Model imports

import { SidePanelParameters } from 'src/enums/side-panel.enum';
import Site from 'src/model/site';
import { WriteTransactionOptions } from 'ol/format/WFS';
import WFSTransactionService from 'src/services/WFSTransactionService';
import { TransactionMode } from 'src/enums/transaction.enum';

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
  const WFS_TRANSACTION_OPTIONS = {
    featureNS: 'ArchaeoSpringMap',
    srsName: 'EPSG:3857',
    featurePrefix: 'ArchaeoSpringMap',
    featureType: 'archsites',
    nativeElements: [],
  };
  const transactor = new WFSTransactionService();

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
    const feature = await useApiClientStore().getSiteById(siteId);

    if (feature) {
      const newSite = new Site({
        ...feature.properties,
        geometry: new GeoJSON().readGeometry(feature.geometry, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857',
        }),
      });

      if (sps.panelParameters.parameterValue !== newSite.siteId.toString()) {
        openSitePanel(newSite.siteId);
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
   * Execute a WFS-Transaction. A feature and a transaction mode shoud be give by the user.
   * @param wfsFeature - The feature.
   * @param mode - The transaction mode.
   */
  async function wfsTransaction(
    wfsFeature: Site,
    mode: TransactionMode
  ): Promise<void> {
    const olTransaction = transactor.writeTransactionByMode(
      mode,
      wfsFeature,
      WFS_TRANSACTION_OPTIONS
    );
    const xmlTransaction = new XMLSerializer().serializeToString(olTransaction);
    const transactionResult = await useApiClientStore().postWFSTransaction(
      xmlTransaction
    );

    if (transactionResult)
      transactor.checkResult(transactionResult, TransactionMode.UPDATE);
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
    if (sps.panelParameters.location === SidePanelParameters.SITE) {
      openSitePanel(parseInt(sps.panelParameters.parameterValue as string));
    }
  });

  return {
    site,
    openSitePanel,
    updateSite,
    wfsTransaction,
    closeSitePanel,
  };
});
