<script setup lang="ts">
// Vue/Quasar imports

// Store imports
import { useMeasureStore } from 'src/stores/measure-store';

// Map imports

// Others imports

// Interface / enums imports
import { GeometryType } from '../../enums/map.enum';
import { UserMessage } from 'src/enums/user-messages.enum';

// Script
const mes = useMeasureStore();

const mainList = [
  {
    action: (): void => mes.abortCurrentMeasure(),
    text: 'Measure',
  },
];

const measureItemList = [
  {
    action: (): void => mes.addMeasure(GeometryType.LINE_STRING),
    text: UserMessage.MEASURE.DISTANCE,
  },
  {
    action: (): void => mes.addMeasure(GeometryType.POLYGON),
    text: UserMessage.MEASURE.AREA,
  },
  {
    action: (): void => mes.removeMeasure(),
    text: UserMessage.MEASURE.DELETE,
  },
];
</script>

<template>
  <q-menu touch-position context-menu class="bg-secondary app-font">
    <q-list dense style="min-width: 100px">
      <!-- Measure section -->
      <q-item
        v-for="(mainItem, indexMainItem) in mainList"
        :key="indexMainItem"
        clickable
        @click="mainItem.action"
      >
        <q-item-section>{{ mainItem.text }}</q-item-section>
        <q-item-section side>
          <q-icon name="keyboard_arrow_right" />
        </q-item-section>

        <q-menu
          anchor="top end"
          self="top start"
          class="bg-secondary app-font"
          :offset="[5, 0]"
        >
          <q-list>
            <!-- Line measure-->
            <q-item
              v-for="(measureItem, indexMeasureItem) in measureItemList"
              :key="indexMeasureItem"
              v-close-popup
              dense
              clickable
              @click="measureItem.action"
              ><q-item-section>{{ measureItem.text }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-item>
    </q-list>
  </q-menu>
</template>

<style lang="scss"></style>
