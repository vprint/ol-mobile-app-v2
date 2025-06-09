// Map imports
import { Collection, Feature } from 'ol';
import GeoJSON from 'ol/format/GeoJSON.js';
import VectorTileLayer from 'ol/layer/VectorTile';

// Vue/Quasar imports
import { onMounted, Ref, ref, watch } from 'vue';
import { defineStore, storeToRefs } from 'pinia';

// Store imports
import { useApiClientStore } from './api-client-store';
import { ISidePanelParameters, useSidePanelStore } from './side-panel-store';
import { useMapStore } from './map-store';
import { useDrawStore } from './draw-store';
import { useMapInteractionStore } from './map-interaction-store';

// Others imports
import {
  VectorTileSelectEvent,
  VectorTileSelectEventType,
} from 'src/services/VectorTileSelect';
import { Feature as GeoJSONFeature } from 'geojson';
import WFSTransactionService from 'src/services/WFSTransactionService';
import NotificationService from 'src/services/notifier/Notifier';
import Site from 'src/model/site';

// Enum / Interface / Model imports
import { SidePanelParameters } from 'src/enums/side-panel.enum';
import { TransactionMode } from 'src/enums/map.enum';
import { LAYER_PROPERTIES_FIELD, LayerIdentifier } from 'src/enums/layers.enum';
import { UserMessage } from 'src/enums/user-messages.enum';
import VectorTileInteraction from 'src/services/VectorTileInteraction';

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
  const drawStore = useDrawStore();
  const sidePanelStore = useSidePanelStore();
  const { panelParameters } = storeToRefs(sidePanelStore);
  const mapStore = useMapStore();
  const mapInteractionStore = useMapInteractionStore();

  const site: Ref<Site | undefined> = ref();
  let archsiteLayer: VectorTileLayer | undefined;
  let vectorTileInteraction: VectorTileInteraction | undefined;

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
    _getVectorTileInteraction()?.getSelector()?.clear();
    _fitMap();
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

      if (panelParameters.value.parameterValue !== newSite.siteId.toString()) {
        openSitePanel(newSite.siteId);
      }

      _fitMap(feature);
      site.value = newSite;
      _getVectorTileInteraction()
        ?.getSelector()
        ?.setAsSelected([siteId.toString()]);
    }
  }

  function _getVectorTileInteraction(): VectorTileInteraction | undefined {
    if (!vectorTileInteraction) {
      const interactionName = `VECTOR_TILE_INTERACTION_NAME_${
        archsiteLayer?.get(LAYER_PROPERTIES_FIELD).title
      }`;

      vectorTileInteraction =
        mapInteractionStore.getInteractionByName<VectorTileInteraction>(
          interactionName
        );
    }

    return vectorTileInteraction;
  }

  /**
   * Fit the map to the selected site and set the style.
   * @param geoJsonFeature - Selected feature
   */
  function _fitMap(geoJsonFeature?: GeoJSONFeature): void {
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
   * @param selection - The selection event
   */
  function _manageSelection(selection: VectorTileSelectEvent): void {
    const features = selection.selected;

    if (features && features.length > 0) {
      openSitePanel(features[0].getId() as number);

      _getVectorTileInteraction()
        ?.getSelector()
        ?.setAsSelected([features[0].getId()?.toString()]);
    }

    if (!(features && features.length > 0) && site.value) {
      const siteId = site.value.attributes.archsite_id;
      _getVectorTileInteraction()
        ?.getSelector()
        ?.setAsSelected([siteId.toString()]);
    }
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
   * @param isInitialized - Is the map initialized ?
   */
  function initializeStore(): void {
    archsiteLayer = mapStore.getLayerById<VectorTileLayer>(
      LayerIdentifier.SITES
    );

    _getVectorTileInteraction()
      ?.getSelector()
      // @ts-expect-error type error
      ?.on(VectorTileSelectEventType.VECTOR_TILE_SELECT, _manageSelection);
  }

  /**
   * Open the site panel if needed
   */
  function _openSiteIfNecessary(): void {
    if (panelParameters.value.location === SidePanelParameters.SITE) {
      openSitePanel(parseInt(panelParameters.value.parameterValue as string));
    }
  }

  /**
   * Analyzes the value of the new route parameters.
   * Clears the site if the route is not site-related. Does nothing if the new site is the same as the previous one.
   * Sets the site if the ID is different from the previous one.
   * @param route - The route parameters
   */
  function _analyzeRoutes(route: ISidePanelParameters): void {
    if (!_isSiteRoute(route)) {
      clearSite();
      return;
    }

    const siteId = parseInt(route.parameterValue as string);
    if (_siteIsSameAsPrevious(siteId)) {
      return;
    }

    setSiteById(siteId);
  }

  /**
   * watch for site change in URL
   */
  watch(panelParameters, _analyzeRoutes);
  onMounted(_openSiteIfNecessary);

  return {
    site,
    initializeStore,
    enableModification,
    openSitePanel,
    updateSite,
    wfsTransaction,
    closeSitePanel,
  };
});
