import Style, { StyleFunction } from 'ol/style/Style';
import { IStyleCache } from 'src/interface/ILayers';
import { SiteAttributes } from './site-type.enums';
import { FeatureLike } from 'ol/Feature';
import { Fill, Stroke, Circle } from 'ol/style';

export const getArchSiteStyleFunction = (): StyleFunction => {
  const styleCache: IStyleCache = {};

  return (feature: FeatureLike): Style => {
    const archsiteId = feature.get(SiteAttributes.SITE_ID);
    const groundVerified = feature.get(SiteAttributes.GROUND_VERIFIED);
    const key = `${archsiteId}-${groundVerified}`;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (styleCache[key]) {
      return styleCache[key];
    }

    const style = new Style({
      image: new Circle({
        fill: new Fill({
          color: groundVerified ? '#2f7a34' : '#8a1946',
        }),
        radius: 8,
        stroke: new Stroke({
          color: 'rgba(255,255,255,1)',
          width: 2,
        }),
      }),
    });

    styleCache[key] = style;
    return style;
  };
};
