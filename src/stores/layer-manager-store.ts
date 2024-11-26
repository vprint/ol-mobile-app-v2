// Map imports

// Vue/Quasar imports
import { onMounted, Ref, ref, watch } from 'vue';

// Store imports
import { defineStore } from 'pinia';
import { useSidePanelStore } from './side-panel-store';
import { useMapStore } from './map-store';

// Interface, type and enum imports
import { SIDE_PANEL_PARAM } from 'src/utils/params/sidePanelParams';
import { LAYER_PROPERTIES } from 'src/utils/params/layersParams';
import { ILayerProperties } from 'src/interface/ILayerParameters';

// Others imports

// script
interface ILayerIndex {
  layerId: string;
  zIndex: number;
}

/**
 * This store manage the right side panel and provide related functionnalities.
 */
export const useLayerManagerStore = defineStore('layerManager', () => {
  const sps = useSidePanelStore();
  const mas = useMapStore();

  /**
   * Is the layer manager opened ?
   */
  const isActive = ref(false);
  /**
   * The list of layer available in the layer manager
   */
  const layers: Ref<ILayerIndex[]> = ref([]);

  onMounted(() => {
    getTunableLayers();
  });

  /**
   * Get all tunable layers.
   */
  function getTunableLayers(): void {
    const mapLayers = mas.map.getAllLayers();

    mapLayers.forEach((layer) => {
      const layerProperties = layer.get(LAYER_PROPERTIES) as
        | ILayerProperties
        | undefined;

      if (layerProperties?.tunable) {
        const zIndex = layer.getZIndex();
        const layerInformation = {
          layerId: layerProperties.id,
          zIndex: zIndex ? zIndex : 0,
        };

        layers.value.push(layerInformation);
        sortLayersByIndex(layers.value);
      }
    });
  }

  /**
   * This function sort layers by index (usefull after a user reordering).
   * @param layerlist list of layers to sort
   */
  function sortLayersByIndex(layerlist: ILayerIndex[]): ILayerIndex[] {
    layerlist.sort((a, b) => b.zIndex - a.zIndex);
    return layerlist;
  }

  /**
   * private store method
   * Activate / deactivate layer tree
   * @param mode Should the layer tree be opened or closed ?
   */
  function setActive(mode: boolean): void {
    const params = mode
      ? {
          location: SIDE_PANEL_PARAM.LAYER_LIST,
        }
      : undefined;

    useSidePanelStore().setActive(mode, params);
    isActive.value = mode;
  }

  function openLayerManager(): void {
    setActive(true);
  }

  function closeLayerManager(): void {
    setActive(false);
  }

  /**
   * Watch for panel parameters change and set/unset active status.
   */
  watch(
    () => sps.panelParameters.location,
    () => {
      isActive.value =
        sps.panelParameters.location === SIDE_PANEL_PARAM.LAYER_LIST;
    }
  );

  return {
    isActive,
    openLayerManager,
    closeLayerManager,
  };
});
