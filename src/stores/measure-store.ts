// Map import

// Vue/Quasar imports
import { defineStore } from 'pinia';
import { watch } from 'vue';

// Store imports
import { useMapStore } from 'stores/map-store';

// Others imports

// Interface imports
import Measure, { MeasureEventType } from 'src/services/measure/Measure';

// Enum imports
import { GeometryType } from 'src/enums/map.enum';
import { useSelectionStore } from 'stores/selection-store';
import {
  IFeatureInformation,
  VECTOR_SELECT_EVENT,
  VectorSelectionEvent,
} from 'src/services/VectorFeatureSelect';
import { Feature, getUid } from 'ol';

//script

/**
 * This store provides measure management tools (e.g., remove measure, add measure)
 */
export const useMeasureStore = defineStore('measure', () => {
  const mapStore = useMapStore();
  const selectionStore = useSelectionStore();

  const measurePlugin = new Measure();
  measurePlugin.setActive(false);

  /**
   * Activate measure
   * @param mode - Measure mode - can be either Polygon or LineString
   */
  function addMeasure(
    mode: GeometryType.LINE_STRING | GeometryType.POLYGON
  ): void {
    measurePlugin.setActive(true);
    measurePlugin.createMeasureFeature(mode);
  }

  /**
   * Remove the selected measure, or all measure if any is selected.
   */
  function removeMeasure(): void {
    const feature = measurePlugin.modifyInteraction.getFeature();

    feature
      ? measurePlugin.removeSelectedMeasure()
      : measurePlugin.removeAllMeasures();
  }

  /**
   * Abort the current measure
   */
  function abortCurrentMeasure(): void {
    measurePlugin.abortMeasuring();
  }

  /**
   * Manage the selection event.
   */
  function _manageSelectEvent(evt: VectorSelectionEvent): void {
    const measureFeatures = _extractMeasureFeature(evt.featureInformations);

    if (_shouldClearSelection(measureFeatures)) {
      measurePlugin.unselectMeasure();
    }

    if (_canModify(evt.featureInformations) && measureFeatures.length > 0) {
      measurePlugin.selectMeasure(measureFeatures[0]);
    }

    if (!_canModify(evt.featureInformations)) {
      measurePlugin.unselectMeasure();
    }
  }

  function _extractMeasureFeature(
    featureDetails: IFeatureInformation[]
  ): Feature[] {
    return featureDetails
      .filter((information) => _isMeasureFeature(information))
      .map((information) => information.feature as Feature);
  }

  function _isMeasureFeature(information: IFeatureInformation): boolean {
    return getUid(information.layer) === getUid(measurePlugin.getLayer());
  }

  function _shouldClearSelection(measures: Feature[]): boolean {
    return measures.length === 0;
  }

  /**
   * Can the measure be modified?
   * If something else than a measure is selected, then we can't edit the measure.
   * @param featureDetails - The selected features' information.
   */
  function _canModify(featureDetails: IFeatureInformation[]): boolean {
    let shouldAdd = true;

    featureDetails.forEach((information) => {
      if (!_isMeasureFeature(information)) {
        shouldAdd = false;
      }
    });

    return shouldAdd;
  }

  function _setupEventListeners(): void {
    // @ts-expect-error - OL Type error
    measurePlugin.on(MeasureEventType.MEASURE_START, () => {
      selectionStore.selectPlugin.setActive(false);
    });

    // @ts-expect-error - OL Type error
    measurePlugin.on(MeasureEventType.MEASURE_END, () => {
      selectionStore.selectPlugin.setActive(true);
    });

    // @ts-expect-error - OL Type error
    selectionStore.selectPlugin.on(VECTOR_SELECT_EVENT, _manageSelectEvent);
  }

  watch(
    () => selectionStore.isInitialized,
    (isInitialized) => {
      if (isInitialized) {
        _setupEventListeners();
        selectionStore.selectPlugin.addLayer(measurePlugin.getLayer());
        mapStore.map.addInteraction(measurePlugin);
      }
    }
  );

  return {
    addMeasure,
    removeMeasure,
    abortCurrentMeasure,
  };
});
