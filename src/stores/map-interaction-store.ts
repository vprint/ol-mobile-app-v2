// Map import
import { Pixel } from 'ol/pixel';
import VectorTileLayer from 'ol/layer/VectorTile';
import { FeatureLike } from 'ol/Feature';
import { MapBrowserEvent } from 'ol';

// Vue/Quasar imports
import { ref } from 'vue';

// Store imports
import { defineStore, storeToRefs } from 'pinia';
import { useMapStore } from './map-store';
import { useSiteStore } from './site-store';

// Others imports

// Interface imports

/**
 * Store and manage mapInteraction. Exemple : enable or disable the click interaction that allow to select site (see enableClickSelector).
 */
export const useMapInteractionStore = defineStore('mapInteraction', () => {
  const { map } = storeToRefs(useMapStore());
  const isSelectorActive = ref(true);
  const isMeasureActive = ref(false);

  const { getLayerByName } = useMapStore();
  const { setSite } = useSiteStore();

  /**
   * Get vector tile feature at a given pixel
   * @param pixel
   * @param vectorTileLayer
   * @returns
   */
  async function getVectorTileFeatureAtPixel(
    pixel: Pixel,
    vectorTileLayer: VectorTileLayer<FeatureLike>
  ): Promise<FeatureLike | undefined> {
    const features = await vectorTileLayer.getFeatures(pixel);

    if (features.length > 0) {
      return features[0];
    }

    return undefined;
  }

  /**
   * Enable or disable click event
   * @param active
   */
  function enableClickSelector(active: boolean): void {
    isSelectorActive.value = active;
    active
      ? map.value.on('click', selectSite)
      : map.value.on('click', selectSite);
  }

  /**
   * Select site at a given pixel
   * @param e UI Event (exemple: click)
   */
  async function selectSite(e: MapBrowserEvent<UIEvent>): Promise<void> {
    const listenedLayer = getLayerByName(
      'sites'
    ) as VectorTileLayer<FeatureLike>;
    const feature = await getVectorTileFeatureAtPixel(e.pixel, listenedLayer);
    const featureId = feature ? (feature.getId() as number) : undefined;

    if (featureId) {
      setSite(featureId);
    }
  }

  return { enableClickSelector };
});
