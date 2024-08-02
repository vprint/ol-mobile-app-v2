// Map import
import { Overlay } from 'ol';

// Vue/Quasar imports
import { defineStore, storeToRefs } from 'pinia';
import { Ref, ref } from 'vue';

// Store imports
import { useMapStore } from './map-store';

// Others imports

// Interface imports

/**
 * This store manage map overlay (e.g set the overlay visible, set the overlay title).
 */
export const useMapOverlayStore = defineStore('mapOverlay', () => {
  const defaultOverlay: Ref<HTMLElement | null> = ref(null);
  const isVisible = ref(false);
  const { map } = storeToRefs(useMapStore());
  const overlay: Ref<Overlay | undefined> = ref(undefined);
  const title = ref('Measure');
  const content = ref('Click to start drawing');

  /**
   * Set the working overlay
   * @param newOverlay Overlay
   */
  function setOverlay(htmlElement: HTMLElement): void {
    defaultOverlay.value = htmlElement;

    const _overlay = new Overlay({
      element: htmlElement,
      offset: [15, 15],
    });

    map.value.addOverlay(_overlay);
    overlay.value = _overlay;

    map.value.on('pointermove', (e) => {
      overlay.value?.setPosition(e.coordinate);
    });
  }

  /**
   * set the overlay visibility
   * @param visible Visibility value
   */
  function setOverlayVisibility(visible: boolean): void {
    isVisible.value = visible;
  }

  /**
   * Set a new title
   * @param _title New title
   */
  function setTitle(_title: string): void {
    title.value = _title;
  }

  /**
   * Set a new content
   * @param _content New content
   */
  function setContent(_content: string): void {
    content.value = _content;
  }

  return {
    isVisible,
    overlay,
    title,
    content,
    setOverlayVisibility,
    setOverlay,
    setTitle,
    setContent,
  };
});
