// Map imports
import Layer from 'ol/layer/Layer';

// Vue/Quasar imports
import { Ref, ref, watch } from 'vue';

// Store imports
import { defineStore } from 'pinia';
import { useSidePanelStore } from './side-panel-store';
import { useMapStore } from './map-store';

// Interface, type and enum imports
import { SidePanelParameters } from 'src/enums/side-panel.enum';
import {
  LAYER_PROPERTIES_FIELD,
  LayerIdentifier,
  LayerProperties,
} from 'src/enums/layers.enum';

// Others imports

// script

interface ILayerEntryIndex {
  layerId: LayerIdentifier;
  zIndex: number;
}

/**
 * Manages the side panel and provides related functionalities.
 */
export const useLayerManagerStore = defineStore('layerManager', () => {
  const sidePanelStore = useSidePanelStore();
  const mapStore = useMapStore();
  const isOpen = ref(false);
  const layersEntry: Ref<ILayerEntryIndex[]> = ref([]);

  /**
   * Set the layer properties
   */
  function _setupLayerProperties(): void {
    if (layersEntry.value.length === 0) {
      const modifiableLayers = _getModifiableLayers();
      _setProperties(modifiableLayers);
      _sortLayersEntryByIndex(layersEntry.value);
    }
  }

  function _setProperties(modifiableLayers: Layer[]): void {
    modifiableLayers.forEach((layer) => {
      const layerProperties = layer.get(LAYER_PROPERTIES_FIELD);
      const zIndex = layer.getZIndex();

      const layerInformation = {
        layerId: layerProperties.id,
        zIndex: zIndex ? zIndex : 0,
      };

      layersEntry.value.push(layerInformation);
    });
  }

  function _getModifiableLayers(): Layer[] {
    return mapStore.getLayersByProperties(
      LayerProperties.ALLOW_PARAMETERS_CHANGE,
      true
    );
  }

  /**
   * This function sort layers by index (useful to initialize the layer manager panel).
   * @param layerList - The list of layers to sort.
   */
  function _sortLayersEntryByIndex(
    layerList: ILayerEntryIndex[]
  ): ILayerEntryIndex[] {
    layerList.sort((a, b) => b.zIndex - a.zIndex);
    return layerList;
  }

  /**
   * Update all the layer entry index (useful after a user reordering)
   */
  function updateLayersEntryIndex(): void {
    const layersCount = layersEntry.value.length;
    layersEntry.value.forEach((layerEntry, index) => {
      const newZIndex = layersCount - index;
      layerEntry.zIndex = newZIndex;
      mapStore.getLayerById(layerEntry.layerId)?.setZIndex(newZIndex);
    });
  }

  async function openLayerManager(): Promise<void> {
    const params = {
      location: SidePanelParameters.LAYER_LIST,
    };

    await sidePanelStore.openPanel(params);
    isOpen.value = true;
  }

  async function closeLayerManager(): Promise<void> {
    await sidePanelStore.closePanel();
    isOpen.value = false;
  }

  /**
   * Watch panel parameters change and set/unset active status.
   */
  watch(
    () => sidePanelStore.panelParameters.location,
    () => {
      isOpen.value =
        sidePanelStore.panelParameters.location ===
        SidePanelParameters.LAYER_LIST;
      if (isOpen.value) _setupLayerProperties();
    }
  );

  /**
   * Watch map initialization and then initialize the layer manager parameters
   */
  watch(
    () => mapStore.isMapInitialized,
    (newValue) => {
      if (newValue) _setupLayerProperties();
    }
  );

  return {
    isOpen,
    layersEntry,
    updateLayersEntryIndex,
    openLayerManager,
    closeLayerManager,
  };
});
