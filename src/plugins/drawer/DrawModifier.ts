import { Interaction, Modify, Select } from 'ol/interaction';
import { Feature, getUid } from 'ol';
import { click } from 'ol/events/condition';
import { Map } from 'ol';
import StyleManager from '../StyleManager';
import VectorLayer from 'ol/layer/Vector';

/**
 * This class provide selection and modification methods for draws.
 */
class DrawModifier extends Interaction {
  private modifyInteraction: Modify | undefined;
  private selectInteraction: Select | undefined;
  private drawLayer: VectorLayer | undefined;
  private style: StyleManager;

  constructor(
    interactionName: string,
    style: StyleManager,
    drawLayer: VectorLayer | undefined
  ) {
    super();
    this.set('name', interactionName);
    this.style = style;
    this.drawLayer = drawLayer;
  }

  /**
   * Initialize the component
   * @param map OpenLayers map
   */
  public setMap(map: Map | null): void {
    super.setMap(map);
    if (map) this.initializeModifier();
  }

  /**
   * Add a select and modify interactions to the draw layer
   */
  private initializeModifier(): void {
    if (this.drawLayer?.getSource()) {
      this.selectInteraction = new Select({
        layers: (layer): boolean => {
          return getUid(layer) === getUid(this.drawLayer);
        },
        condition: click,
        style: this.style.getSelectionStyle(),
        hitTolerance: 30,
      });

      this.modifyInteraction = new Modify({
        style: this.style.getEditionStyle(),
        features: this.selectInteraction.getFeatures(),
      });

      this.getMap()?.addInteraction(this.selectInteraction);
      this.getMap()?.addInteraction(this.modifyInteraction);
    }
  }

  /**
   * Remove select and modify interactions.
   * This is usefull when the user is drawing as it's allow to avoid unwanted selection on previous feature.
   */
  public removeModifier(): void {
    if (this.modifyInteraction && this.selectInteraction) {
      this.getMap()?.removeInteraction(this.modifyInteraction);
      this.getMap()?.removeInteraction(this.selectInteraction);
    }
  }

  /**
   * Remove the selected feature
   * @param feature - Draw feature to remove
   */
  public removeFeature(): void {
    const feature = this.getFeature();

    if (feature) {
      this.drawLayer?.getSource()?.removeFeature(feature);
    }

    this.selectInteraction?.getFeatures().clear();
  }

  /**
   * Get the selected feature
   * @returns
   */
  public getFeature(): Feature | undefined {
    return this.selectInteraction?.getFeatures().getArray()[0];
  }

  /**
   * Clear feature from the selector. Doesn't remove the feature from the layer like `removeFeature`.
   */
  public unselectFeature(): void {
    this.selectInteraction?.getFeatures().clear();
  }
}

export default DrawModifier;
