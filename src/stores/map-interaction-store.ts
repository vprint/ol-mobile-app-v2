// Map import
import { Interaction, Link } from 'ol/interaction';

// Vue/Quasar imports
import { defineStore } from 'pinia';
import { Ref, ref, watch } from 'vue';

// Store imports
import { useMapStore } from './map-store';

// Others imports
import VectorTileSelect from 'src/plugins/VectorTileSelect';
import Measure from 'src/plugins/measure/Measure';

// Interface imports
import { INTERACTIONS_PARAMS } from 'src/utils/params/interactionsParams';
import VectorTileLayer from 'ol/layer/VectorTile';
import { Style, Stroke, Fill } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { Attribution, ScaleLine } from 'ol/control';

/**
 * Store and manage mapInteraction.
 * Exemple : enable or disable the click interaction that allow to select site.
 */
export const useMapInteractionStore = defineStore('mapInteraction', () => {
  const isMapInteractionsInitialized = ref(false);
  const ms = useMapStore();

  const selector: Ref<null | VectorTileSelect> = ref(null);
  const measurePlugin: Ref<null | Measure> = ref(null);
  const selectionStyle = new Style({
    image: new CircleStyle({
      radius: 15,
      fill: new Fill({ color: 'rgba(232,32,192,0.2)' }),
      stroke: new Stroke({ color: '#e820c0', width: 2 }),
    }),
  });

  /**
   * Initialize all interactions
   */
  function initializeInteractions(): void {
    // Create select interaction
    selector.value = new VectorTileSelect({
      name: INTERACTIONS_PARAMS.selector,
      selectableLayer: ms.getLayerById('archsites') as VectorTileLayer,
      selectionStyle: selectionStyle,
    });

    // Create measure interaction
    measurePlugin.value = new Measure(INTERACTIONS_PARAMS.measure);
    measurePlugin.value.setActive(false);

    // Create link
    const link = new Link({
      params: ['x', 'y', 'z', 'r'],
    });
    link.set('name', INTERACTIONS_PARAMS.link);

    // Create scaleline
    const scaleline = new ScaleLine({
      units: 'metric',
      text: true,
      minWidth: 140,
    });
    scaleline.set('name', INTERACTIONS_PARAMS.scaleline);

    // Create attribution
    const attribution = new Attribution({
      collapsible: false,
    });
    attribution.set('name', INTERACTIONS_PARAMS.attribution);

    ms.map.addInteraction(measurePlugin.value as Measure);
    ms.map.addInteraction(selector.value as VectorTileSelect);
    ms.map.addInteraction(link);
    ms.map.addControl(scaleline);
    ms.map.addControl(attribution);

    isMapInteractionsInitialized.value = true;
  }

  /**
   * Activate or deactivate interaction by it's name
   * @param interactionName Interaction name
   * @param active Activate or deactivate the interaction.
   */
  function enableInteraction(
    interactionName: INTERACTIONS_PARAMS,
    active: boolean
  ): void {
    const interaction = getInteractionByName(interactionName);
    interaction?.setActive(active);
  }

  /**
   * Get interaction by name
   * @param name Interaction name
   * @returns Return the interaction or undefined if not found
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
   * Watch for map initialization and then enable the interaction
   */
  watch(
    () => ms.isMapInitialized,
    (isInitialized) => {
      if (isInitialized) {
        initializeInteractions();
      }
    }
  );

  return {
    isMapInteractionsInitialized,
    selector,
    measurePlugin,
    initializeInteractions,
    enableInteraction,
    getInteractionByName,
  };
});
