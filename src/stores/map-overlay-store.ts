// Map import
import { Overlay } from 'ol';

// Vue/Quasar imports
import { defineStore, storeToRefs } from 'pinia';
import { Ref, ref } from 'vue';
import { useMapStore } from './map-store';

// Store imports

// Others imports

// Interface imports

/**
 * Manage map overlay
 */
export const useMapOverlayStore = defineStore('mapOverlay', () => {
  const isVisible = ref(false);
  const { map } = storeToRefs(useMapStore());
  const overlay: Ref<Overlay | undefined> = ref(undefined);

  /**
   * Set the working overlay
   * @param newOverlay Overlay
   */
  function setOverlay(newOverlay: Overlay): void {
    overlay.value = newOverlay;
    map.value.addOverlay(newOverlay);
  }

  /**
   * set the overlay visibility
   * @param visible Visibility value
   */
  function setOverlayVisibility(visible: boolean): void {
    isVisible.value = visible;
  }

  return {
    isVisible,
    overlay,
    setOverlayVisibility,
    setOverlay,
  };
});
