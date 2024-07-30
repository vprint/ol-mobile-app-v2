<script setup lang="ts">
// vue/pinia import
import { storeToRefs } from 'pinia';
import { ref } from 'vue';

// Store import
import { useMapStore } from 'src/stores/map-store';
import { useReferencesStore } from 'src/stores/references-store';
import { useSidePanelStore } from 'src/stores/side-panel-store';

// Component import
import SiteSearchBox from './SiteSearchBox.vue';
import MeasureComponent from '../MeasureComponent/MeasureComponent.vue';

// Others
import { APP_PARAMS } from '../../utils/params/appParams';

// Script
const { isMapInitialized } = storeToRefs(useMapStore());
const { isReferencesInitialized } = storeToRefs(useReferencesStore());
const { panelParameters } = storeToRefs(useSidePanelStore());

function enableLayerTree(mode: boolean): void {
  const params = !mode
    ? {
        location: 'layertree',
      }
    : undefined;

  useSidePanelStore().setActive(!mode, params);
}
</script>

<template>
  <q-toolbar v-if="isMapInitialized" class="bg-secondary text-primary shadow-2">
    <!-- Logo -->
    <q-avatar square>
      <q-img :src="'icons/efeo_logo.png'"></q-img>
    </q-avatar>

    <!-- Title (desktop display only) -->
    <q-toolbar-title v-if="$q.platform.is.desktop">
      {{ APP_PARAMS.applicationName }}
    </q-toolbar-title>

    <!-- Space -->
    <q-space></q-space>

    <q-btn
      :flat="$q.platform.is.desktop"
      :fab="$q.platform.is.desktop"
      :round="$q.platform.is.mobile"
      :square="$q.platform.is.desktop"
      :color="$q.platform.is.mobile ? 'secondary' : undefined"
      icon="sym_s_stacks"
      class="icon-weight-thin"
      :text-color="$q.platform.is.mobile ? 'primary' : undefined"
      @click="enableLayerTree(panelParameters.location === 'layertree')"
    />
    <!-- Measure button -->
    <MeasureComponent v-if="$q.platform.is.desktop"></MeasureComponent>

    <SiteSearchBox v-if="isReferencesInitialized"></SiteSearchBox>
  </q-toolbar>
</template>

<style lang="scss"></style>
