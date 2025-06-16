import { Interaction, Modify } from 'ol/interaction';
import { Collection, Feature, Map } from 'ol';
import { click } from 'ol/events/condition';
import StyleManager from '../StyleManager';
import VectorLayer from 'ol/layer/Vector';

interface IOptions {
  style: StyleManager;
  layer: VectorLayer;
}

/**
 * Provide selection and modification methods for measure.
 */
class MeasureModifier extends Interaction {
  private style: StyleManager;
  private modifyInteraction!: Modify;
  private readonly measureLayer: VectorLayer;
  private features: Collection<Feature> = new Collection<Feature>();
  private readonly isInitialized: boolean;

  constructor(options: IOptions) {
    super();
    this.style = options.style;
    this.measureLayer = options.layer;
    this.setModify();
    this.isInitialized = true;
  }

  public setMap(map: Map | null): void {
    super.setMap(map);
    map?.addInteraction(this.modifyInteraction);
  }

  /**
   * set the modify interaction.
   */
  private setModify(): void {
    this.modifyInteraction = new Modify({
      style: this.style.getSelectionStyle(),
      features: this.features,
      deleteCondition: (event): boolean => {
        return click(event);
      },
    });
  }

  public setActive(active: boolean): void {
    super.setActive(active);

    if (!active) {
      this.unselectFeature();
    }

    if (this.isInitialized) {
      this.modifyInteraction.setActive(active);
    }
  }

  /**
   * Add a new feature to the modifier.
   * @param feature - The feature to modify.
   */
  public addFeature(feature: Feature): void {
    this.unselectFeature();
    feature.setStyle(this.style.getSelectionStyle());
    this.features.push(feature);
  }

  public getFeature(): Feature | undefined {
    return this.features.item(0);
  }

  /**
   * Clear feature from the modifier.
   * Doesn't remove the feature from the layer like `removeFeature`.
   */
  public unselectFeature(): void {
    if (this.features.getLength() > 0) {
      this.features.item(0).setStyle(this.style.getStyle());
      this.features.removeAt(0);
    }
  }
}

export default MeasureModifier;
