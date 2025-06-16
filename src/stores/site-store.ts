// Map imports
import { Collection, getUid } from 'ol';
import GeoJSON from 'ol/format/GeoJSON.js';
import VectorTileLayer from 'ol/layer/VectorTile';

// Vue/Quasar imports
import { Ref, ref, watch } from 'vue';
import { defineStore, storeToRefs } from 'pinia';

// Store imports
import { useApiClientStore } from './api-client-store';
import { ISidePanelParameters, useSidePanelStore } from './side-panel-store';
import { useMapStore } from './map-store';
import { useDrawStore } from './draw-store';

// Others imports
import { Feature as GeoJSONFeature } from 'geojson';
import WFSTransactionService from 'src/services/WFSTransactionService';
import NotificationService from 'src/services/notifier/Notifier';
import Site from 'src/model/site';

// Enum / Interface / Model imports
import { SidePanelParameters } from 'src/enums/side-panel.enum';
import { TransactionMode } from 'src/enums/map.enum';
import { LayerIdentifier } from 'src/enums/layers.enum';
import { UserMessage } from 'src/enums/user-messages.enum';
import { useSelectionStore } from 'stores/selection-store';
import {
  IFeatureInformation,
  VECTOR_SELECT_EVENT,
  VectorSelectionEvent,
} from 'src/services/VectorFeatureSelect';
import { FeatureLike } from 'ol/Feature';

const WFS_TRANSACTION_OPTIONS = {
  featureNS: 'ArchaeoSpringMap',
  srsName: 'EPSG:3857',
  featurePrefix: 'ArchaeoSpringMap',
  featureType: 'archsites',
  nativeElements: [],
};

/**
 * Store sites and related functionalities
 */
export const useSiteStore = defineStore(SidePanelParameters.SITE, () => {
  const mapStore = useMapStore();
  const drawStore = useDrawStore();
  const selectionStore = useSelectionStore();
  const sidePanelStore = useSidePanelStore();

  const { panelParameters } = storeToRefs(sidePanelStore);

  const site: Ref<Site | undefined> = ref();
  let archsiteLayer: VectorTileLayer | undefined;

  /**
   * Close the site panel and clear information
   */
  async function closeSitePanel(): Promise<void> {
    clearSite();
    await sidePanelStore.closePanel();
  }

  /**
   * Clear site values
   */
  function clearSite(): void {
    site.value = undefined;
    archsiteLayer?.changed();
  }

  /**
   * Update site values.
   * The new site can be a modified clone of the original site.
   * @param newSite - The new site
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
      site.value = _readSiteFromJSON(feature);
      archsiteLayer?.changed();

      if (_doesSiteIdDifferFromPanelParameter()) {
        await sidePanelStore.openPanel({
          location: SidePanelParameters.SITE,
          parameterName: 'siteId',
          parameterValue: site.value.siteId.toString(),
        });
      }
    }
  }

  function _readSiteFromJSON(feature: GeoJSONFeature): Site {
    return new Site({
      ...feature.properties,
      geometry: new GeoJSON().readGeometry(feature.geometry, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      }),
    });
  }

  /**
   * TODO: fix this method
   * Enable form modification and drawing.
   * @param active - Should the edition mode be enabled?
   */
  function enableModification(active: boolean): void {
    _getVectorTileInteraction()?.getModifier()?.setActive(active);
    drawStore.setVisible(active);

    if (active && site.value) {
      const features = new Collection([site.value]);

      _getVectorTileInteraction()
        ?.getModifier()
        ?.addFeaturesToModifier(features);
    }
  }

  /**
   * Execute a WFS-T request given a feature and a transaction mode.
   * @param wfsFeature - The feature.
   * @param mode - The transaction mode.
   */
  async function wfsTransaction(
    wfsFeature: Site,
    mode: TransactionMode
  ): Promise<void> {
    const wfsService = new WFSTransactionService(
      wfsFeature,
      mode,
      WFS_TRANSACTION_OPTIONS
    );

    const transaction = wfsService.getTransaction();

    const transactionResult = await useApiClientStore().WFSTransaction(
      transaction
    );

    const isSuccess = wfsService.isSuccess(transactionResult);
    _pushTransactionNotification(isSuccess, mode);
  }

  function _pushTransactionNotification(
    isSuccess: boolean,
    mode: TransactionMode
  ): void {
    const upperCaseMode = mode.toUpperCase() as keyof typeof UserMessage.WFS;
    const result = isSuccess ? 'SUCCESS' : 'FAIL';

    const title = UserMessage.GENERIC[result];
    const text = UserMessage.WFS[upperCaseMode][result];

    isSuccess
      ? new NotificationService().pushSuccess(title, text)
      : new NotificationService().pushError(title, text);
  }

  /**
   * Listen to site selection and set the site parameters.
   * @param informations - The selection information
   */
  async function _manageSelection(
    informations: VectorSelectionEvent
  ): Promise<void> {
    const siteFeatures = _extractSiteFromSelection(
      informations.featureInformations
    );

    if (siteFeatures.length > 0) {
      await setSiteById(siteFeatures[0].getId() as number);
    }
  }

  function _extractSiteFromSelection(
    featureDetails: IFeatureInformation[]
  ): FeatureLike[] {
    return featureDetails
      .filter((information) => _isSiteFeature(information))
      .map((information) => information.feature);
  }

  function _isSiteFeature(information: IFeatureInformation): boolean {
    return getUid(information.layer) === getUid(archsiteLayer);
  }

  function _isSiteRoute(newPanelParameters: ISidePanelParameters): boolean {
    return (
      newPanelParameters.location === SidePanelParameters.SITE &&
      !!newPanelParameters.parameterValue
    );
  }

  function _siteIsSameAsPrevious(siteId: number | undefined): boolean {
    return !!siteId && siteId === site.value?.siteId;
  }

  /**
   * Define the archSite layer if the map is defined and set the listener.
   */
  async function initializeStore(): Promise<void> {
    archsiteLayer = mapStore.getLayerById<VectorTileLayer>(
      LayerIdentifier.SITES
    );

    await _openSiteIfNeeded();

    // @ts-expect-error - OL Type error.
    selectionStore.selectPlugin.on(VECTOR_SELECT_EVENT, _manageSelection);
  }

  /**
   * Open the site panel if needed.
   */
  async function _openSiteIfNeeded(): Promise<void> {
    if (panelParameters.value.location === SidePanelParameters.SITE) {
      await setSiteById(
        parseInt(panelParameters.value.parameterValue as string)
      );
      mapStore.setPaddingAndExtent([0, -400, 0, 0], useSiteStore().site);
    }
  }

  /**
   * Analyzes the value of the new route parameters.
   * Clears the site if the route is not site-related. Does nothing if the new site is the same as the previous one.
   * Sets the site if the ID is different from the previous one.
   * @param route - The route parameters
   */
  async function _analyzeRoutes(route: ISidePanelParameters): Promise<void> {
    if (!_isSiteRoute(route)) {
      clearSite();
      return;
    }

    const siteId = parseInt(route.parameterValue as string);
    if (!_siteIsSameAsPrevious(siteId)) {
      await setSiteById(siteId);
    }
  }

  function _doesSiteIdDifferFromPanelParameter(): boolean {
    return (
      panelParameters.value.parameterValue !== site.value?.siteId.toString()
    );
  }

  /**
   * watch for site change in URL
   */
  watch(panelParameters, _analyzeRoutes);

  return {
    site,
    initializeStore,
    enableModification,
    setSiteById,
    updateSite,
    wfsTransaction,
    closeSitePanel,
  };
});
