<script setup lang="ts">
// Store import
import { storeToRefs } from 'pinia';
import { useMapStore } from 'src/stores/map-store';
import { useReferencesStore } from 'src/stores/references-store';

// Component import
import SiteSearchBox from './SiteSearchBox.vue';

// Others
import { APP_PARAMS } from '../../utils/params/appParams';

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
    <q-toolbar-title v-if="$q.platform.is.desktop">
      {{ APP_PARAMS.applicationName }}
    </q-toolbar-title>

    <!-- Space -->
    <q-space></q-space>

    <SiteSearchBox v-if="isReferencesInitialized"></SiteSearchBox>
  </q-toolbar>
</template>

<style lang="scss"></style>
