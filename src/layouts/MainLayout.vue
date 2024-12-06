<template>
  <q-layout>
    <q-page-container style="overflow: hidden">
      <q-page>
        <!-- Toolbar -->
        <ToolbarComponent></ToolbarComponent>
        <!-- Map -->
        <MapComponent></MapComponent>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import ToolbarComponent from '../components/ToolbarComponent/ToolbarComponent.vue';
import MapComponent from '../components/MapComponent/MapComponent.vue';
</script>
