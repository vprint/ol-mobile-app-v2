<script setup lang="ts">
// vue/pinia import
import { storeToRefs } from 'pinia';

// Store import
import { useMapStore } from 'src/stores/map-store';
import { useReferencesStore } from 'src/stores/references-store';

// Component import
import SiteSearchBox from './SiteSearchBox.vue';
import MeasureComponent from '../MeasureComponent/MeasureComponent.vue';
import LayerManagerButton from '../LayerListComponent/LayerManagerButton.vue';
import LocatorComponent from '../LocatorComponent/LocatorComponent.vue';

// Others
import { APP_PARAMS } from '../../utils/params/appParams';

// Script
const { isMapInitialized } = storeToRefs(useMapStore());
const { isReferencesInitialized } = storeToRefs(useReferencesStore());
</script>

<template>
  <q-toolbar v-if="isMapInitialized" class="bg-secondary text-primary shadow-2">
    <!-- Logo -->
    <q-avatar square>
      <q-img :src="'icons/efeo_logo.png'"></q-img>
    </q-avatar>

    <!-- Title (desktop display only) -->
    <q-toolbar-title v-if="$q.platform.is.desktop" class="merriweather">
      {{ APP_PARAMS.applicationName }}
    </q-toolbar-title>

    <!-- Space -->
    <q-space></q-space>

    <!-- Enable location -->
    <LocatorComponent></LocatorComponent>

    <!-- Layer list button -->
    <LayerManagerButton></LayerManagerButton>

    <!-- Measure button -->
    <MeasureComponent v-if="$q.platform.is.desktop"></MeasureComponent>

    <SiteSearchBox v-if="isReferencesInitialized"></SiteSearchBox>
  </q-toolbar>
</template>

<style lang="scss"></style>
