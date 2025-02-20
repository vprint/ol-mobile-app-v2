import TypedFeature from 'src/services/Feature';
import { ISite } from 'src/interface/ISite';

class Site extends TypedFeature<ISite> {
  public get siteId(): number {
    return this.attributes.siteId;
  }

  override clone(): Site {
    return new Site({
      ...this.getProperties(),
      geometry: this.getGeometry()?.clone(),
    });
  }
}

export default Site;
