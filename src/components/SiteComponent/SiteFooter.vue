<script setup lang="ts">
// Store import
import { useDrawStore } from 'src/stores/draw-store';
import { useMapStore } from 'src/stores/map-store';

// Map import
import { Collection, Feature } from 'ol';

import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

// Model import
import Site from 'src/model/site';

// Service import
import ExtendedModify from 'src/services/drawer/ExtendedModify';
import StyleManager from 'src/services/StyleManager';

const drawStore = useDrawStore();
const mapStore = useMapStore();
const editionMode = defineModel<boolean>('editionMode');
const siteFeature = defineModel<Site>('siteFeature');
const emit = defineEmits(['submit', 'reset']);

function submit(): void {
  //enableEdition(false);
  emit('submit');
}

function reset(): void {
  enableEdition(false);
  emit('reset');
}

const modifier = new ExtendedModify(
  'site-modifier',
  new StyleManager({
    strokeColor: 'red',
    fillColor: 'blue',
    strokeWidth: 1,
  }),
  new VectorLayer({
    source: new VectorSource(),
    zIndex: 999,
  })
);
</script>

<template>
  <div class="site-buttons">
    <q-btn
      v-if="!editionMode"
      rounded
      color="primary"
      label="Edit"
      class="buttons merriweather"
      @click="enableEdition(true)"
    />
    <q-btn
      v-if="editionMode"
      outline
      rounded
      color="primary"
      label="Cancel"
      class="buttons merriweather"
      @click="reset()"
    />
    <q-btn
      v-if="editionMode"
      rounded
      color="primary"
      label="Save"
      class="buttons merriweather"
      @click="submit()"
    />
  </div>
</template>

<style scoped lang="scss">
.site-buttons {
  margin: 8px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;

  .buttons {
    min-width: 100px;
  }
}
</style>
