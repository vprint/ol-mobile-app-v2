import '../css/app.scss';

// Map import
import { Interaction, Link } from 'ol/interaction';
import { Attribution, Control, ScaleLine } from 'ol/control';
import { Style, Stroke, Fill } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import VectorTileLayer from 'ol/layer/VectorTile';

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

/**
 * Store and manage mapInteraction.
 * Exemple : enable or disable the click interaction that allow to select site.
 */
export const useMapInteractionStore = defineStore('mapInteraction', () => {
  const ms = useMapStore();
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

  const link = new Link({
    params: ['x', 'y', 'z', 'r'],
  });
  link.set('name', Interactions.LINK);

  const scaleline = new ScaleLine({
    units: 'metric',
    text: true,
    minWidth: 140,
    className: 'app-scale-line',
  });
  scaleline.set('name', Interactions.SCALELINE);

  const attribution = new Attribution({
    label: _getAttributionIcon(),
    collapseLabel: _getAttributionIcon(),
  });
  attribution.set('name', Interactions.ATTRIBUTION);

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
    return [measurePlugin, drawPlugin, link];
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
      ms.map.addInteraction(interaction);
    });

    measurePlugin.setActive(false);
    drawPlugin.setActive(false);

    // add the contols
    getControls().forEach((control) => {
      ms.map.addControl(control);
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
  function getInteractionByName(name: string): Interaction | undefined {
    let findedElement: Interaction | undefined;

    ms.map.getInteractions().forEach((interaction) => {
      if (interaction.get('name') === name) {
        findedElement = interaction;
      }
    });

    return findedElement;
  }

  /**
   * Watch for map initialization and then enable the interaction.
   */
  watch(
    () => ms.isMapInitialized,
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
