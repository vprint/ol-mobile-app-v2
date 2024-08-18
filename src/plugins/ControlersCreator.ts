import { Attribution } from 'ol/control';
import { ScaleLine } from 'ol/control.js';
import Link from 'ol/interaction/Link';
import { Map } from 'ol';

/**
 * This function add basic interaction and control to the map
 * @param map Carte
 */
function addControlers(map: Map): void {
  map.addInteraction(new Link());

  map.addControl(
    new ScaleLine({
      units: 'metric',
      bar: false,
      text: true,
      minWidth: 140,
    })
  );

  map.addControl(
    new Attribution({
      collapsible: false,
    })
  );
}

export default addControlers;
