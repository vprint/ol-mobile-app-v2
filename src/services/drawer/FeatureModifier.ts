import { Interaction, Modify } from 'ol/interaction';
import { Collection, Feature, Map } from 'ol';
import StyleManager from 'src/services/StyleManager';

interface IOptions {
  style: StyleManager
}

class FeatureModifier extends Interaction {
  private modifier!: Modify;
  private readonly features!: Collection<Feature>;

  constructor(options: IOptions) {
    super();
    this.features = new Collection<Feature>();
    this.setModifier(options.style);
  }

  private setModifier(style: StyleManager): void {
    this.modifier = new Modify({
      style: style.getEditionStyle(),
      features: this.features,
    });
  }

  /**
   * Add feature to the modifier.
   * Note: This removes the previously modified feature.
   * @param feature - The feature to add to the modifier.
   */
  public addFeature(feature: Feature): void {
    this.removeFeature();
    this.features.push(feature);
  }

  /**
   * Remove a feature from the modifier.
   */
  public removeFeature(): void {
    this.features.clear();
  }

  public setActive(active: boolean): void {
    super.setActive(active);
    this.modifier.setActive(active);
  }

  public setMap(map: Map | null): void {
    super.setMap(map);
    if (map) this.modifier.setMap(map);
  }
}
