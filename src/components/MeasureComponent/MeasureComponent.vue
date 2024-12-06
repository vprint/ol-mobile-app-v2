<script setup lang="ts">
// Vue/Quasar imports

// Store imports
import { useMeasureStore } from 'src/stores/measure-store';

// Map imports

// Others imports
import { GeometryType } from '../../enums/geometry.enum';

// Script
const mes = useMeasureStore();
</script>

<template>
  <q-btn
    unelevated
    icon="sym_s_straighten"
    :text-color="$q.platform.is.mobile ? 'primary' : undefined"
    class="app-button btn--no-hover"
    @click="mes.removeMeasure"
  >
    <q-menu
      v-model="mes.measureMenu"
      square
      :offset="[-5, 10]"
      class="bg-secondary text-primary"
    >
      <q-list>
        <q-item
          v-close-popup
          clickable
          @click="mes.addMeasure(GeometryType.LINE_STRING)"
        >
          <q-item-section>
            <q-icon name="straighten" class="app-button btn--no-hover" />
          </q-item-section>
          <q-tooltip
            anchor="bottom middle"
            self="bottom middle"
            transition-show="scale"
            transition-hide="scale"
            :delay="1000"
            style="border-radius: 0"
          >
            Distance measurement
          </q-tooltip>
        </q-item>

        <q-item
          v-close-popup
          clickable
          @click="mes.addMeasure(GeometryType.POLYGON)"
        >
          <q-item-section>
            <q-icon name="square_foot" class="app-button btn--no-hover" />
          </q-item-section>
          <q-tooltip
            anchor="bottom middle"
            self="bottom middle"
            transition-show="scale"
            transition-hide="scale"
            :delay="1000"
            style="border-radius: 0"
          >
            Area measurement
          </q-tooltip>
        </q-item>

        <q-item v-close-popup clickable @click="mes.removeAllMeasure()">
          <q-item-section>
            <q-icon name="delete" class="app-button btn--no-hover" />
          </q-item-section>
          <q-tooltip
            anchor="bottom middle"
            self="bottom middle"
            transition-show="scale"
            transition-hide="scale"
            :delay="1000"
            style="border-radius: 0"
          >
            Remove all measurement
          </q-tooltip>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<style lang="scss"></style>
