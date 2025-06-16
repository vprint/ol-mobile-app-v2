import { defineStore } from 'pinia';
import { useMapStore } from 'stores/map-store';
import { LayerProperties } from 'src/enums/layers.enum';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorLayer from 'ol/layer/Vector';
import VectorFeatureSelect from 'src/services/VectorFeatureSelect';
import { ref } from 'vue';

export const useSelectionStore = defineStore('selectionStore', () => {
  const mapStore = useMapStore();
  const selectPlugin = new VectorFeatureSelect();
  const isInitialized = ref(false);

  function initializeSelection(): void {
    const selectableLayers = _getSelectableLayers();
    _addLayersToSelector(selectableLayers);
    mapStore.map.addInteraction(selectPlugin);
    isInitialized.value = true;
  }

  function _getSelectableLayers(): (VectorLayer | VectorTileLayer)[] {
    return mapStore.getLayersByProperties(
      LayerProperties.ALLOW_SELECTION,
      true
    ) as (VectorLayer | VectorTileLayer)[];
  }

  function _addLayersToSelector(
    layers: (VectorLayer | VectorTileLayer)[]
  ): void {
    layers.forEach((layer) => selectPlugin.addLayer(layer));
  }

  return {
    selectPlugin,
    isInitialized,
    initializeSelection,
  };
});
