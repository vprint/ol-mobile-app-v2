import { Feature } from 'ol';
import { GeoJSONFeature } from 'ol/format/GeoJSON';
import GeoJSON from 'ol/format/GeoJSON';

/**
 * Extended OL Feature class proving types for attributes
 */
class TypedFeature<IAttributes extends object> extends Feature {
  public attributes!: IAttributes;
  private isInitialized = false;

  constructor(feature: GeoJSONFeature) {
    super({
      ...feature.properties,
      geometry: new GeoJSON().readGeometry(feature.geometry),
    });

    this.manageAttributes(feature);
  }

  override get<Key extends string & keyof IAttributes>(
    key: Key
  ): IAttributes[Key] {
    return super.get(key) as IAttributes[Key];
  }

  override getProperties(): Partial<IAttributes> {
    return super.getProperties() as IAttributes;
  }

  override set<Key extends string & keyof IAttributes>(
    key: Key,
    value: IAttributes[Key]
  ): void {
    if (this.isInitialized) this.attributes[key] = value;
  }

  override setProperties(props: Partial<IAttributes>, silent?: boolean): void {
    super.setProperties(props, silent);
    if (this.isInitialized) Object.assign(this.attributes, props);
  }

  /**
   * Set attributes to the feature and add the proxy to track attributes change
   * @param feature - The input feature
   */
  private manageAttributes(feature: GeoJSONFeature): void {
    this.attributes = feature.properties as IAttributes;
    this.attributes = new Proxy(
      this.attributes,
      this.getAttributeChangeManager()
    );
    this.isInitialized = true;
  }

  /**
   * Get the attribute change manager. This manager allows to
   * change properties in the class and in the OL feature.
   * @returns
   */
  private getAttributeChangeManager(): ProxyHandler<IAttributes> {
    return {
      set: (target: IAttributes, key: PropertyKey, value: unknown): boolean => {
        target[key as keyof IAttributes] =
          value as IAttributes[keyof IAttributes];
        super.set(key as string & keyof IAttributes, value);
        return true;
      },
    };
  }
}

export default TypedFeature;
