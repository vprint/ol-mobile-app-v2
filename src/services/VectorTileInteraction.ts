import { LAYER_PROPERTIES_FIELD } from 'src/enums/layers.enum';
import VectorLayer from 'ol/layer/Vector';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorSource from 'ol/source/Vector';
import ExtendedModify from 'src/services/drawer/ExtendedModify';
import StyleManager from 'src/services/StyleManager';
import VectorTileSelect from 'src/services/VectorTileSelect';
import Style from 'ol/style/Style';
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import FeatureHover from './FeatureHover';
import { Interaction } from 'ol/interaction';
import { Map } from 'ol';
import { InteractionSettings } from 'src/enums/map.enum';

export const VECTOR_TILE_INTERACTION_NAME = 'vector_tile_interaction_name';
const MODIFIER_NAME = 'modifier';

/**
 * Manage the vector tile layer interactions. Include select, modify and hover.
 */
class VectorTileInteraction extends Interaction {
  private featureHover: FeatureHover | undefined;
  private modifier: ExtendedModify | undefined;
  private vectorTileSelect: VectorTileSelect | undefined;

  constructor(vectorTileLayer: VectorTileLayer) {
    super();

    this.set(
      InteractionSettings.NAME,
      `VECTOR_TILE_INTERACTION_NAME_${
        vectorTileLayer.get(LAYER_PROPERTIES_FIELD).title
      }`
    );
    this.initializeSelector(vectorTileLayer);
    this.initializeModifier(vectorTileLayer);
    this.initializeHover(vectorTileLayer);
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

  // #region modify

  /**
   * Add a modify interaction over the vector tile layer.
   * This create an associated modification vector layer that will be used to display modified features.
   * @param vectorTileLayer - The vector tile layer.
   */
  private initializeModifier(vectorTileLayer: VectorTileLayer): void {
    let zIndex = vectorTileLayer.getZIndex();
    if (zIndex) {
      zIndex = zIndex + 1;
    }

    const modificationLayer = new VectorLayer({
      source: new VectorSource(),
      zIndex,
    });

    this.modifier = this.createModifier(vectorTileLayer, modificationLayer);
  }

  private createModifier(
    vectorTileLayer: VectorTileLayer,
    modificationLayer: VectorLayer
  ): ExtendedModify {
    return new ExtendedModify({
      name: `${
        vectorTileLayer.get(LAYER_PROPERTIES_FIELD).title
      }_${MODIFIER_NAME}`,
      style: new StyleManager({
        strokeColor: 'rgba(232,32,192,1)',
        fillColor: 'rgba(232,32,192,0.2)',
        strokeWidth: 2,
      }),
      layer: modificationLayer,
    });
  }

  public getModifier(): ExtendedModify | undefined {
    return this.modifier;
  }

  public setMap(map: Map | null): void {
    super.setMap(map);

    if (this.vectorTileSelect) map?.addInteraction(this.vectorTileSelect);
    if (this.featureHover) map?.addInteraction(this.featureHover);
    if (this.modifier) {
      map?.addInteraction(this.modifier);
      map?.addLayer(this.modifier.getLayer());
    }
  }
}

export default VectorTileInteraction;
