import '../css/app.scss';

// Map import
import { Interaction, Link } from 'ol/interaction';
import { Attribution, Control, ScaleLine } from 'ol/control';

// Vue/Quasar imports
import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

// Store imports
import { useMapStore } from './map-store';

// Services imports
import Measure from 'src/services/measure/Measure';
import ExtendedDraw from 'src/services/drawer/ExtendedDraw';
import StyleManager from 'src/services/StyleManager';

// Interface imports
import { Interactions } from 'src/enums/interactions.enum';

// Icon import
import attributionIcon from '../../public/icons/ctrl-attrib.svg';
import { InteractionSettings } from 'src/enums/map.enum';

/**
 * Store and manage mapInteraction.
 * Exemple : enable or disable the click interaction that allow to select site.
 */
export const useMapInteractionStore = defineStore('mapInteraction', () => {
  const mapStore = useMapStore();
  const isMapInteractionsInitialized = ref(false);

  const measurePlugin = new Measure(Interactions.MEASURE);

  const drawPlugin = new ExtendedDraw(
    Interactions.DRAWER,
    new StyleManager({
      strokeColor: 'rgba(232,32,192,1)',
      fillColor: 'rgba(232,32,192,0.2)',
      strokeWidth: 2,
    })
  );

  const scaleline = new ScaleLine({
    units: 'metric',
    text: true,
    minWidth: 140,
    className: 'app-scale-line',
  });
  scaleline.set(InteractionSettings.NAME, Interactions.SCALELINE);

  const attribution = new Attribution({
    label: _getAttributionIcon(),
    collapseLabel: _getAttributionIcon(),
  });
  attribution.set(InteractionSettings.NAME, Interactions.ATTRIBUTION);

  function _getAttributionIcon(): HTMLElement {
    const span = document.createElement('span');
    span.className = 'attribution-icon-container';
    span.innerHTML = `<img src="${attributionIcon}" alt="Attribution" width="24" height="24">`;
    return span;
  }

  /**
   * Get the map interactions.
   * @returns List of map interactions.
   */
  function getInteractions(): Interaction[] {
    return [measurePlugin, drawPlugin];
  }

  /**
   * Get the map controls.
   * @returns List of map controls.
   */
  function getControls(): Control[] {
    return [scaleline, attribution];
  }

  /**
   * Initialize all map interactions and controls.
   */
  function initializeMapInteractions(): void {
    // Add the interactions
    getInteractions().forEach((interaction) => {
      mapStore.map.addInteraction(interaction);
    });

    measurePlugin.setActive(false);
    drawPlugin.setActive(false);

    // add the contols
    getControls().forEach((control) => {
      mapStore.map.addControl(control);
    });

    isMapInteractionsInitialized.value = true;
  }

  /**
   * Activate or deactivate interaction by it's name.
   * @param interactionName - Interaction name.
   * @param active - Activate or deactivate the interaction.
   */
  function enableInteraction(
    interactionName: Interactions,
    active: boolean
  ): void {
    const interaction = getInteractionByName(interactionName);
    interaction?.setActive(active);
  }

  /**
   * Get interaction by name.
   * @param name - The interaction name.
   * @returns Return the interaction or undefined if not found.
   */
  function getInteractionByName<T = Interaction>(name: string): T | undefined {
    let findedElement: Interaction | undefined;

    mapStore.map.getInteractions().forEach((interaction) => {
      if (interaction.get(InteractionSettings.NAME) === name) {
        findedElement = interaction;
      }
    });

    return findedElement as T;
  }

  /**
   * Watch for map initialization and then enable the interaction.
   */
  watch(
    () => mapStore.isMapInitialized,
    (isInitialized) => {
      if (isInitialized) {
        initializeMapInteractions();
      }
    }
  );

  return {
    isMapInteractionsInitialized,
    measurePlugin,
    drawPlugin,
    enableInteraction,
    getInteractionByName,
  };
});
