// Map imports
import { Collection, Feature } from 'ol';
import GeoJSON from 'ol/format/GeoJSON.js';

// Vue/Quasar imports
import { onMounted, Ref, ref, watch } from 'vue';
import { defineStore, storeToRefs } from 'pinia';

// Store imports
import { useMapInteractionStore } from './map-interaction-store';
import { useApiClientStore } from './api-client-store';
import { ISidePanelParameters, useSidePanelStore } from './side-panel-store';
import { useMapStore } from './map-store';
import { useDrawStore } from './draw-store';

// Others imports
import {
  VectorTileSelectEvent,
  VectorTileSelectEventType,
} from 'src/services/VectorTileSelect';
import { Feature as GeoJSONFeature } from 'geojson';

// Enum / Interface / Model imports
import { SidePanelParameters } from 'src/enums/side-panel.enum';
import { TransactionMode } from 'src/enums/map.enum';
import Site from 'src/model/site';
import WFSTransactionService from 'src/services/WFSTransactionService';
import { LayerIdentifier } from 'src/enums/layers.enum';
import ExtendedVectorTileLayer from 'src/services/ExtendedVectorTileLayer';

const WFS_TRANSACTION_OPTIONS = {
  featureNS: 'ArchaeoSpringMap',
  srsName: 'EPSG:3857',
  featurePrefix: 'ArchaeoSpringMap',
  featureType: 'archsites',
  nativeElements: [],
};

/**
 * Store sites and and related functionnalities
 */
export const useSiteStore = defineStore(SidePanelParameters.SITE, () => {
  const mapInteractionStore = useMapInteractionStore();
  const drawStore = useDrawStore();
  const sidePanelStore = useSidePanelStore();
  const mapStore = useMapStore();
  const { isMapInteractionsInitialized } = storeToRefs(mapInteractionStore);
  const transactor = new WFSTransactionService();
  const site: Ref<Site | undefined> = ref();
  const archsiteLayer = mapStore.getLayerById<ExtendedVectorTileLayer>(
    LayerIdentifier.SITES
  );

  /**
   * Main site-store function that allow to set the working site by it's id.
   * @param newSiteId - Id of the new site.
   */
  async function openSitePanel(newSiteId: number): Promise<void> {
    sidePanelStore.setActive(true, {
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
    sidePanelStore.setActive(false);
  }

  /**
   * Clear site values
   */
  function clearSite(): void {
    site.value = undefined;
    archsiteLayer?.getSelector()?.clear();
    fitMap();
  }

  /**
   * Update site values. NewSite can be for exemple a modified clone of the original site.
   * @param site - New site
   */
  function updateSite(newSite: Site): void {
    site.value = newSite;
  }

  /**
   * Request site information by id and open the panel
   * @param siteId - SiteId
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

      if (
        sidePanelStore.panelParameters.parameterValue !==
        newSite.siteId.toString()
      ) {
        openSitePanel(newSite.siteId);
      }

      fitMap(feature);
      site.value = newSite;
      archsiteLayer?.getSelector()?.setAsSelected([siteId.toString()]);
    }
  }

  /**
   * Fit the map to the selected site and set the style.
   * @param geoJsonFeature - Selected feature
   */
  function fitMap(geoJsonFeature?: GeoJSONFeature): void {
    let feature: Feature | undefined = undefined;

    if (geoJsonFeature) {
      feature = new GeoJSON().readFeature(geoJsonFeature, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      }) as Feature;
      sidePanelStore.setPanelPadding(true, feature);
    }

    archsiteLayer?.changed();
  }

  /**
   * Enable form modification and drawing.
   * @param active - Should the edition mode be enabled ?
   */
  function enableModification(active: boolean): void {
    archsiteLayer?.enableModifier(active);
    drawStore.setVisible(active);

    if (active && site.value) {
      const features = new Collection([site.value]);
      archsiteLayer?.getModifier()?.addFeaturesToModifier(features);
    }
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
    archsiteLayer?.getSelector()?.on(
      // @ts-expect-error type error
      VectorTileSelectEventType.VECTOR_TILE_SELECT,
      (e: VectorTileSelectEvent) => {
        const features = e.selected;

        if (features && features.length > 0) {
          openSitePanel(features[0].getId() as number);
          archsiteLayer
            .getSelector()
            ?.setAsSelected([features[0].getId()?.toString()]);
        }

        if (!(features && features.length > 0) && site.value) {
          const siteId = site.value.attributes.archsite_id;
          archsiteLayer.getSelector()?.setAsSelected([siteId.toString()]);
        }
      }
    );
  }

  /**
   * watch for site change in URL
   */
  watch(
    () => sidePanelStore.panelParameters,
    (newRoute) => {
      if (!_isSiteParams(newRoute)) {
        clearSite();
        return;
      }

      const siteId = parseInt(newRoute.parameterValue as string);
      if (_siteIsSameAsPrevious(siteId)) {
        return;
      }

      setSiteById(siteId);
    }
  );

  function _isSiteParams(newPanelParameters: ISidePanelParameters): boolean {
    return (
      newPanelParameters.location === SidePanelParameters.SITE &&
      !!newPanelParameters.parameterValue
    );
  }

  function _siteIsSameAsPrevious(siteId: number | undefined): boolean {
    return !!siteId && siteId === site.value?.siteId;
  }

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
    if (sidePanelStore.panelParameters.location === SidePanelParameters.SITE) {
      openSitePanel(
        parseInt(sidePanelStore.panelParameters.parameterValue as string)
      );
    }
  });

  return {
    site,
    enableEdition: enableModification,
    openSitePanel,
    updateSite,
    wfsTransaction,
    closeSitePanel,
  };
});
