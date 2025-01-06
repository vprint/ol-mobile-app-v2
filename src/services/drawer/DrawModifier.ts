import { Interaction, Modify, Select } from 'ol/interaction';
import { Feature, getUid } from 'ol';
import { click } from 'ol/events/condition';
import { Map } from 'ol';
import StyleManager from '../StyleManager';
import VectorLayer from 'ol/layer/Vector';

/**
 * Provide selection and modification methods for draws.
 */
class ExtendedModify extends Interaction {
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
   * Initialize the component and add the required interactions.
   * @param map - OpenLayers map
   */
  public setMap(map: Map | null): void {
    super.setMap(map);

    if (
      this.drawLayer?.getSource() &&
      !this.selectInteraction &&
      !this.modifyInteraction
    ) {
      this.selectInteraction = this.getSelect(this.drawLayer);
      this.getMap()?.addInteraction(this.selectInteraction);

      this.modifyInteraction = this.getModify(this.selectInteraction);
      this.getMap()?.addInteraction(this.modifyInteraction);
    }
  }

  /**
   * Get the modify interaction.
   * @param selector - The select interaction.
   * @returns
   */
  private getModify(selector: Select): Modify {
    return new Modify({
      style: this.style.getEditionStyle(),
      features: selector.getFeatures(),
    });
  }

  /**
   * Creates a select interaction for the specified layer.
   * @param selectionLayer - The layer on which to enable selection.
   * @returns A Select interaction configured for the given layer.
   */
  private getSelect(selectionLayer: VectorLayer): Select {
    return new Select({
      layers: (layer): boolean => {
        return getUid(layer) === getUid(selectionLayer);
      },
      condition: click,
      style: this.style.getSelectionStyle(),
      hitTolerance: 30,
    });
  }

  setActive(active: boolean): void {
    super.setActive(active);
    if (this.modifyInteraction && this.selectInteraction) {
      this.modifyInteraction.setActive(active);
      this.selectInteraction.setActive(active);
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
   * Get the modified feature
   * @returns
   */
  public getFeature(): Feature | undefined {
    return this.selectInteraction?.getFeatures().getArray()[0];
  }

  /**
   * Clear feature from the modifier.
   * Doesn't remove the feature from the layer like `removeFeature`.
   */
  public unselectFeature(): void {
    this.selectInteraction?.getFeatures().clear();
  }
}

export default ExtendedModify;
