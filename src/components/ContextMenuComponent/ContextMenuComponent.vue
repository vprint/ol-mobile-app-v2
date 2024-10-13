<script setup lang="ts">
// Vue/Quasar imports

// Store imports
import { useMeasureStore } from 'src/stores/measure-store';

// Map imports

// Others imports

// Interface imports

// Script
const mes = useMeasureStore();
</script>

<template>
  <q-menu square touch-position context-menu class="bg-secondary merriweather">
    <q-list dense style="min-width: 100px">
      <!-- Measure section -->
      <q-item clickable @click="mes.removeMeasure()">
        <q-item-section>Measure</q-item-section>
        <q-item-section side>
          <q-icon name="keyboard_arrow_right" />
        </q-item-section>

        <q-menu
          square
          anchor="top end"
          self="top start"
          class="bg-secondary merriweather"
        >
          <q-list>
            <!-- Line measure-->
            <q-item
              v-close-popup
              dense
              clickable
              @click="mes.addMeasure('LineString')"
              ><q-item-section>Distance</q-item-section>
            </q-item>

            <!-- Polygon measure-->
            <q-item
              v-close-popup
              dense
              clickable
              @click="mes.addMeasure('Polygon')"
            >
              <q-item-section>Area</q-item-section>
            </q-item>

            <!-- Remove measure-->
            <q-item
              v-close-popup
              dense
              clickable
              @click="mes.removeAllMeasure()"
            >
              <q-item-section>Remove measure</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-item>
    </q-list>
  </q-menu>
</template>

<style lang="scss"></style>
