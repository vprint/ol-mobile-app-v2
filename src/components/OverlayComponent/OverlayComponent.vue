<script setup lang="ts">
// Vue/Quasar imports
import { onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';

// Component imports

// Store imports
import { useMapOverlayStore } from 'src/stores/map-overlay-store';

// Map imports

// Others imports

// Script
const { isVisible, title, content } = storeToRefs(useMapOverlayStore());
const { setOverlay } = useMapOverlayStore();

let divOverlay: HTMLElement | null;

onMounted(() => {
  divOverlay = document.querySelector('#popup');
  if (divOverlay) {
    setOverlay(divOverlay);
  }
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
    <q-card-section class="bg-accent text-white">
      {{ title }}
    </q-card-section>

    <q-card-section class="overlay-info"> {{ content }} </q-card-section>
  </q-card>
</template>

<style lang="scss">
.overlay-box {
  z-index: 1000;
  min-width: 100px;
  border-radius: 2px;
  background-color: rgba(255, 255, 255, 0);
  display: none;
}

.overlay-info {
  background-color: rgba(255, 255, 255, 0.8);
}
</style>
