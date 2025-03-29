// Map imports
import { Collection, Feature } from 'ol';
import GeoJSON from 'ol/format/GeoJSON.js';

// Vue/Quasar imports
import { onMounted, Ref, ref, watch } from 'vue';
import { defineStore, storeToRefs } from 'pinia';

// Store imports
import { useMapInteractionStore } from './map-interaction-store';
import { useApiClientStore } from './api-client-store';
import { useSidePanelStore } from './side-panel-store';
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
import { TransactionMode } from 'src/enums/transaction.enum';
import Site from 'src/model/site';
import WFSTransactionService from 'src/services/WFSTransactionService';
import { LayerIdentifier } from 'src/enums/layers.enum';

/**
 * Store sites and and related functionnalities
 */
export const useSiteStore = defineStore(SidePanelParameters.SITE, () => {
  const mapInteractionStore = useMapInteractionStore();
  const drawStore = useDrawStore();
  const sitePanelStore = useSidePanelStore();
  const mapStore = useMapStore();

  const { isMapInteractionsInitialized } = storeToRefs(mapInteractionStore);

  const WFS_TRANSACTION_OPTIONS = {
    featureNS: 'ArchaeoSpringMap',
    srsName: 'EPSG:3857',
    featurePrefix: 'ArchaeoSpringMap',
    featureType: 'archsites',
    nativeElements: [],
  };
  const transactor = new WFSTransactionService();
  const site: Ref<Site | undefined> = ref();

  /**
   * Main site-store function that allow to set the working site by it's id.
   * @param newSiteId - Id of the new site.
   */
  async function openSitePanel(newSiteId: number): Promise<void> {
    sitePanelStore.setActive(true, {
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
    sitePanelStore.setActive(false);
  }

  /**
   * Clear site values
   */
  function clearSite(): void {
    site.value = undefined;
    mapInteractionStore.selectorPlugin.clear();
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
        sitePanelStore.panelParameters.parameterValue !==
        newSite.siteId.toString()
      ) {
        openSitePanel(newSite.siteId);
      }

      fitMap(feature);
      site.value = newSite;
      mapInteractionStore.selectorPlugin.setAsSelected([siteId.toString()]);
    }
  }

  /**
   * Fit the map to the selected site and set the style.
   * @param geoJsonFeature - Selected feature
   */
  function fitMap(geoJsonFeature?: GeoJSONFeature): void {
    if (geoJsonFeature) {
      const feature = new GeoJSON().readFeature(geoJsonFeature, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      }) as Feature;
      sitePanelStore.setPanelPadding(true, feature);
    }

    const archLayer = mapStore.getLayerById(LayerIdentifier.SITES);
    archLayer?.changed();
  }

  /**
   * Enable form modification and drawing.
   * @param active - Should the edition mode be enabled ?
   */
  function enableEdition(active: boolean): void {
    const modifier = mapInteractionStore.modifierPlugin;
    drawStore.setVisible(active);
    modifier.setActive(active);

    // TODO: FIXME: A débroussailler
    if (active) {
      const features = new Collection([site.value] as Feature[]);
      modifier.addFeaturesToModifier(features);
      const modificationLayer = modifier.getModificationLayer();
      mapStore.map.addLayer(modificationLayer);
      modificationLayer.getSource()?.clear();
      modificationLayer.getSource()?.addFeatures(features.getArray());
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
    mapInteractionStore.selectorPlugin.on(
      // @ts-expect-error type error
      VectorTileSelectEventType.VECTOR_TILE_SELECT,
      (e: VectorTileSelectEvent) => {
        const features = e.selected;

        if (features && features.length > 0) {
          openSitePanel(features[0].getId() as number);
          mapInteractionStore.selectorPlugin.setAsSelected([
            features[0].getId()?.toString(),
          ]);
        }
      }
    );
  }

  /**
   * watch for site change in URL
   */
  watch(
    () => sitePanelStore.panelParameters,
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
    if (sitePanelStore.panelParameters.location === SidePanelParameters.SITE) {
      openSitePanel(
        parseInt(sitePanelStore.panelParameters.parameterValue as string)
      );
    }
  });

  return {
    site,
    enableEdition,
    openSitePanel,
    updateSite,
    wfsTransaction,
    closeSitePanel,
  };
});
