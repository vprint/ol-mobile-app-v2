<script setup lang="ts">
// Vue/Quasar imports
import { Ref, ref } from 'vue';
import { storeToRefs } from 'pinia';

// Store imports
import { useMapInteractionStore } from 'src/stores/map-interaction-store';

// Map imports
import { Geometry, LineString, Polygon } from 'ol/geom';
import { unByKey } from 'ol/Observable';

// Others imports
import {
  IMeasureType,
  MeasureEventType,
  MeasureStartEvent,
} from 'src/plugins/MeasurePlugin';
import { INTERACTIONS_PARAMS } from 'src/utils/params/interactionsParams';

// Script

const { measurePlugin } = storeToRefs(useMapInteractionStore());
const { enableInteraction } = useMapInteractionStore();
const formatedMeasure: Ref<string> = ref('');
const measure: Ref<number> = ref(0);
const measureMenu = ref(false);

/**
 * Manaage measure activation / deactivation
 */
function manageMeasure(mode: IMeasureType): void {
  measurePlugin.value.setActive(true);
  measurePlugin.value.addMeasure(mode);
  enableInteraction(INTERACTIONS_PARAMS.selector, false);
}

/**
 * Open menu and set selection mode to true
 */
function manageMenu(): void {
  measurePlugin.value.removeMeasure();
  enableInteraction(INTERACTIONS_PARAMS.selector, true);
}

/**
 * Calculate measure for a given polygon
 * @param geom Input geometry
 */
function calculateMeasure(geom: Geometry): void {
  // Calculate area if geometry is a polygon
  if (geom instanceof Polygon) {
    formatedMeasure.value = formatArea(geom);
    measure.value = geom.getArea();
  }
  // Calculate length if geometry is a line
  else if (geom instanceof LineString) {
    formatedMeasure.value = formatLength(geom);
    measure.value = geom.getLength();
  }
}

/**
 * Format length output.
 * @param line The line
 * @returns The formatted length.
 */
function formatLength(line: LineString): string {
  const length = line.getLength();
  let output: string;

  if (length > 100) {
    output = `${Math.round((length / 1000) * 100) / 100} km`;
  } else {
    output = `${Math.round(length * 100) / 100} m`;
  }
  return output;
}

/**
 * Format area output
 * @param polygon The polygone
 * @returns Formatted area
 */
function formatArea(polygon: Polygon): string {
  const area = polygon.getArea();
  let output: string;

  if (area > 10000) {
    output = `${Math.round((area / 1000000) * 100) / 100} km²`;
  } else {
    output = `${Math.round(area * 100) / 100} m²`;
  }
  return output;
}

/**
 * Manage measure start event
 */
const onMeasureStart = measurePlugin.value.on(
  // @ts-expect-error - Type problems due to typescript / ol
  MeasureEventType.MEASURE_START,
  (e: MeasureStartEvent) => {
    e.feature.getGeometry()?.on('change', (evt) => {
      const geom = evt.target as Geometry;
      calculateMeasure(geom);
    });
  }
);

/**
 * Manage measure end event and remove listeners
 */
measurePlugin.value.on(
  // @ts-expect-error - Type problems due to typescript / ol
  MeasureEventType.MEASURE_END,
  () => {
    measurePlugin.value.removeMeasure();
    formatedMeasure.value = '0';
    enableInteraction(INTERACTIONS_PARAMS.selector, true);

    unByKey(onMeasureStart);
  }
);
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
    @click="manageMenu"
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
          @click="manageMeasure('LineString')"
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

        <q-item v-close-popup clickable @click="manageMeasure('Polygon')">
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
