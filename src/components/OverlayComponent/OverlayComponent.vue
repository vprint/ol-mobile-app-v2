<script setup lang="ts">
// Vue/Quasar imports
import { onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';

// Component imports

// Store imports
import { useMapOverlayStore } from 'src/stores/map-overlay-store';
import { useMapStore } from 'src/stores/map-store';

// Map imports

import { Overlay } from 'ol';

// Others imports

// Script
const { map } = storeToRefs(useMapStore());
const { isVisible } = storeToRefs(useMapOverlayStore());
const { setOverlay } = useMapOverlayStore();

let divOverlay: HTMLElement | null;
let overlay: Overlay;

onMounted(() => {
  divOverlay = document.querySelector('#popup');

  if (divOverlay) {
    overlay = new Overlay({
      element: divOverlay,
      offset: [15, 15],
    });
  }

  setOverlay(overlay);

  map.value.on('pointermove', (e) => {
    overlay.setPosition(e.coordinate);
  });
});

watch(
  () => isVisible.value,
  (newVisibility) => {
    if (newVisibility && divOverlay) {
      divOverlay.style.display = 'block';
    }
    if (!newVisibility && divOverlay) {
      divOverlay.style.display = 'none';
    }
  },
  {
    deep: true,
  }
);
</script>

<template>
  <!-- Overlay -->
  <q-card id="popup" class="overlay-box">
    <q-card-section class="bg-secondary text-white"> YOLO </q-card-section>

    <q-card-section class="overlay-info"> CONTENT </q-card-section>
  </q-card>
</template>

<style lang="scss">
.overlay-box {
  z-index: 1000;
  border-radius: 0px;
  background-color: rgba(255, 255, 255, 0);
  display: none;
}

.overlay-info {
  background-color: rgba(255, 255, 255, 0.8);
}
</style>
