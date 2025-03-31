import { Interaction } from 'ol/interaction';
import { Map } from 'ol';

export function hasInteraction(
  map: Map,
  userInteraction: Interaction
): boolean {
  let hasInteraction = false;
  const interactions = map.getInteractions();

  interactions.forEach((interaction) => {
    if (interaction === userInteraction) {
      hasInteraction = true;
    }
  });

  return hasInteraction;
}
