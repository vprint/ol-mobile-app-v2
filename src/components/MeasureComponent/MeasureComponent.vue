<script setup lang="ts">
// Vue/Quasar imports
import { storeToRefs } from 'pinia';

// Store imports
import { useMeasureStore } from 'src/stores/measure-store';

// Map imports

// Others imports

// Script
const { addMeasure, removeMeasure } = useMeasureStore();
const { measureMenu } = storeToRefs(useMeasureStore());
</script>

<template>
  <q-btn
    :flat="$q.platform.is.desktop"
    :fab="$q.platform.is.desktop"
    :round="$q.platform.is.mobile"
    :color="$q.platform.is.mobile ? 'secondary' : undefined"
    icon="sym_s_straighten"
    class="icon-weight-thin"
    :text-color="$q.platform.is.mobile ? 'primary' : undefined"
    @click="removeMeasure"
  >
    <q-menu
      v-model="measureMenu"
      :offset="[-5, 10]"
      class="bg-secondary text-primary"
    >
      <q-list>
        <q-item
          v-close-popup
          clickable
          class="icon-weight-thin"
          @click="addMeasure('LineString')"
        >
          <q-item-section>
            <q-icon name="straighten" />
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

        <q-item v-close-popup clickable @click="addMeasure('Polygon')">
          <q-item-section>
            <q-icon name="square_foot" />
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
      </q-list>
    </q-menu>
  </q-btn>
</template>

<style lang="scss"></style>
