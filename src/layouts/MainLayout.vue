<template>
  <q-layout>
    <!-- Toolbar -->
    <q-header elevated>
      <ToolbarComponent></ToolbarComponent>
    </q-header>

    <q-page-container style="overflow: hidden">
      <q-page>
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

<style></style>
