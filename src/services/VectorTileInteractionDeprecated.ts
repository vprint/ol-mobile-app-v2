import { LAYER_PROPERTIES_FIELD } from 'src/enums/layers.enum';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSelect from 'src/services/VectorTileSelect';
import Style from 'ol/style/Style';
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import FeatureHover from './FeatureHover';
import { Interaction } from 'ol/interaction';
import { Map } from 'ol';
import { InteractionSettings } from 'src/enums/map.enum';
import { Interactions } from 'src/enums/interactions.enum';


/**
 * Manage the vector tile layer interactions. Include select, modify and hover.
 */
class VectorTileInteractionDeprecated extends Interaction {
  private featureHover!: FeatureHover;
  private vectorTileSelect!: VectorTileSelect;
  private readonly isInitialized: boolean

  constructor(vectorTileLayer: VectorTileLayer) {
    super();

    this.set(
      InteractionSettings.NAME,
      `${Interactions.VECTOR_TILE}_${
        vectorTileLayer.get(LAYER_PROPERTIES_FIELD).title
      }`
    );

    this.initializeSelector(vectorTileLayer);
    this.initializeHover(vectorTileLayer);
    this.isInitialized = true;
  }

  // #region selection

  public getSelector(): VectorTileSelect | undefined {
    return this.vectorTileSelect;
  }

  /**
   * Add a selector on the vector tile layer.
   * @param vectorTileLayer - The vector tile layer.
   */
  private initializeSelector(vectorTileLayer: VectorTileLayer): void {
    this.vectorTileSelect = new VectorTileSelect({
      selectableLayer: vectorTileLayer,
      selectionStyle: new Style({
        image: new CircleStyle({
          radius: 15,
          fill: new Fill({ color: 'rgba(232,32,192,0.2)' }),
          stroke: new Stroke({ color: '#e820c0', width: 2 }),
        }),
      }),
    });
  }

  private initializeHover(vectorTileLayer: VectorTileLayer): void {
    this.featureHover = FeatureHover.getInstance(vectorTileLayer);
  }

  public setMap(map: Map | null): void {
    super.setMap(map);

    if (this.isInitialized) {
      map?.addInteraction(this.vectorTileSelect);
      map?.addInteraction(this.featureHover);
    }
  }
}

export default VectorTileInteractionDeprecated;
