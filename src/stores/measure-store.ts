// Map import
import { Geometry, LineString, Polygon } from 'ol/geom';
import { unByKey } from 'ol/Observable';

// Vue/Quasar imports
import { defineStore, storeToRefs } from 'pinia';
import { ref, Ref } from 'vue';

// Store imports
import { useMapInteractionStore } from './map-interaction-store';

// Others imports

// Interface imports
import {
  IMeasureType,
  MeasureEventType,
  MeasureStartEvent,
} from 'src/plugins/MeasurePlugin';

// Enum imports
import { INTERACTIONS_PARAMS } from 'src/utils/params/interactionsParams';
import { useMapOverlayStore } from './map-overlay-store';

//script

/**
 * Measure store manager
 */
export const useMeasureStore = defineStore('measureStore', () => {
  const { enableInteraction } = useMapInteractionStore();
  const { measurePlugin } = storeToRefs(useMapInteractionStore());
  const { setOverlayVisibility } = useMapOverlayStore();
  const measure: Ref<number> = ref(0);
  const formatedMeasure: Ref<string> = ref('');
  const measureMenu = ref(false);

  /**
   * Activate measure
   * @param mode Measure mode - can be either Polygon or LineString
   */
  function addMeasure(mode: IMeasureType): void {
    measurePlugin.value.setActive(true);
    measurePlugin.value.addMeasure(mode);
    enableInteraction(INTERACTIONS_PARAMS.selector, false);
    setOverlayVisibility(true);
  }

  /**
   * Remove measure and activate selector
   */
  function removeMeasure(): void {
    measurePlugin.value.removeMeasure();
    enableInteraction(INTERACTIONS_PARAMS.selector, true);
    setOverlayVisibility(false);
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
      removeMeasure();
      unByKey(onMeasureStart);
    }
  );

  return {
    addMeasure,
    removeMeasure,
    calculateMeasure,
    formatedMeasure,
    measureMenu,
  };
});
