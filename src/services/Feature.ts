import Geometry from 'ol/geom/Geometry';
import { Feature } from 'ol';
import { ObjectWithGeometry } from 'ol/Feature';

/**
 * An extended feature class providing types for attributes.
 * Attributes can be accessed through `attributes`.
 */
class TypedFeature<IAttributes extends object> extends Feature {
  private _attributes!: IAttributes;
  private isInitialized = false;

  /**
   * Feature attributes with type.
   */
  public get attributes(): IAttributes {
    return this._attributes;
  }

  constructor(geometryOrProperties: Geometry | ObjectWithGeometry | undefined) {
    super(geometryOrProperties);
    this.addProxy();
    this.isInitialized = true;
  }

  /**
   * Set the attributes and setup the proxy to track attributes change.
   */
  private addProxy(): void {
    this._attributes = new Proxy(
      this.getProperties() as IAttributes,
      this.getHandler()
    );
  }

  /**
   * Get the attributes handler. This manager allows to
   * change properties in both the class and the OL feature.
   * @returns - The proxy handler.
   */
  private getHandler(): ProxyHandler<IAttributes> {
    return {
      set: (target: IAttributes, key: PropertyKey, value: unknown): boolean => {
        target[key as keyof IAttributes] =
          value as IAttributes[keyof IAttributes];
        super.set(key as string & keyof IAttributes, value);
        return true;
      },

      get: (
        target: IAttributes,
        key: string
      ): IAttributes[string & keyof IAttributes] => {
        return this.get(key as string & keyof IAttributes);
      },
    };
  }

  override get<Key extends string & keyof IAttributes>(
    key: Key
  ): IAttributes[Key] {
    return super.get(key) as IAttributes[Key];
  }

  override getProperties(): IAttributes {
    return super.getProperties() as IAttributes;
  }

  override set<Key extends string & keyof IAttributes>(
    key: Key,
    value: IAttributes[Key]
  ): void {
    if (this.isInitialized) {
      this.attributes[key] = value;
    } else {
      super.set(key, value);
    }
  }

  override setProperties(props: IAttributes, silent?: boolean): void {
    super.setProperties(props, silent);
    if (this.isInitialized) Object.assign(this.attributes, props);
  }

  /**
   * Clone the feature.
   * @returns A new instance of the feature.
   */
  override clone(): TypedFeature<IAttributes> {
    return new TypedFeature<IAttributes>({
      ...this.getProperties(),
      geometry: this.getGeometry()?.clone(),
    });
  }

  /**
   * Return the typed feature as an OpenLayers feature.
   * @returns An OpenLayers feature.
   */
  getAsFeature(): Feature {
    return this as Feature;
  }
}

export default TypedFeature;
