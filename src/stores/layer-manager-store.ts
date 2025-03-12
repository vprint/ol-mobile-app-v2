// Map imports

// Vue/Quasar imports
import { Ref, ref, watch } from 'vue';

// Store imports
import { defineStore } from 'pinia';
import { useSidePanelStore } from './side-panel-store';
import { useMapStore } from './map-store';

// Interface, type and enum imports
import type { ILayerProperties } from 'src/interface/ILayerParameters';
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
 * This store manage the side panel and provide related functionnalities.
 */
export const useLayerManagerStore = defineStore('layerManager', () => {
  const sps = useSidePanelStore();
  const mas = useMapStore();

  /**
   * Is the layer manager opened ?
   */
  const isOpen = ref(false);
  /**
   * The list of layer available in the layer manager
   */
  const layersEntry: Ref<ILayerEntryIndex[]> = ref([]);

  /**
   * Get all tunable layers.
   */
  function getTunableLayers(): void {
    if (layersEntry.value.length === 0) {
      const tunableLayers = mas.getLayersByProperties(
        LayerProperties.TUNABLE,
        true
      );

      tunableLayers.forEach((layer) => {
        const layerProperties = layer.get(
          LAYER_PROPERTIES_FIELD
        ) as ILayerProperties;

        const zIndex = layer.getZIndex();
        const layerInformation = {
          layerId: layerProperties.id,
          zIndex: zIndex ? zIndex : 0,
        };

        layersEntry.value.push(layerInformation);
        sortLayersEntryByIndex(layersEntry.value);
      });
    }
  }

  /**
   * This function sort layers by index (usefull to initialize the layer manager panel).
   * @param layerlist list of layers to sort
   */
  function sortLayersEntryByIndex(
    layerlist: ILayerEntryIndex[]
  ): ILayerEntryIndex[] {
    layerlist.sort((a, b) => b.zIndex - a.zIndex);
    return layerlist;
  }

  /**
   * Update all the layer entry index (usefull after a user reordering)
   */
  function updateLayersEntryIndex(): void {
    const layersCount = layersEntry.value.length;
    layersEntry.value.forEach((layerEntry, index) => {
      const newZIndex = layersCount - index;
      layerEntry.zIndex = newZIndex;
      mas.getLayerById(layerEntry.layerId)?.setZIndex(newZIndex);
    });
  }

  /**
   * private store method
   * Activate / deactivate the layer manager
   * @param mode Should the layer manager be opened or closed ?
   */
  function setPanelActive(mode: boolean): void {
    const params = mode
      ? {
          location: SidePanelParameters.LAYER_LIST,
        }
      : undefined;

    sps.setActive(mode, params);
    isOpen.value = mode;
  }

  function openLayerManager(): void {
    setPanelActive(true);
  }

  function closeLayerManager(): void {
    setPanelActive(false);
  }

  /**
   * Watch for panel parameters change and set/unset active status.
   */
  watch(
    () => sps.panelParameters.location,
    () => {
      isOpen.value =
        sps.panelParameters.location === SidePanelParameters.LAYER_LIST;
      if (isOpen.value) getTunableLayers();
    }
  );

  /**
   * Watch for map initialization and then initialize the layer manager parameters
   */
  watch(
    () => mas.isMapInitialized,
    (newValue) => {
      if (newValue) getTunableLayers();
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
