import GeoJSON from 'ol/format/GeoJSON.js';
import { Feature } from 'ol';
import { GeoJSONFeature } from 'ol/format/GeoJSON';
import TypedFeature from 'src/services/TypedFeature';
import { ISite } from 'src/interface/ISite';
import { SiteAttributes } from 'src/enums/site-type.enums';

const booleanAttributes = [
  SiteAttributes.VERIFIED,
  SiteAttributes.CERAMICS,
  SiteAttributes.LOOTED,
  SiteAttributes.CULTIVATED,
  SiteAttributes.CLEARED,
  SiteAttributes.THREATENED,
  SiteAttributes.MATERIAL_SANDSTONE,
  SiteAttributes.MATERIAL_PINK_SANDSTONE,
  SiteAttributes.MATERIAL_LATERITE,
  SiteAttributes.MATERIAL_BRICK,
  SiteAttributes.MATERIAL_THMAPHNOM,
  SiteAttributes.MATERIAL_OTHER,
  SiteAttributes.ARTEFACTS_PEDESTAL,
  SiteAttributes.ARTEFACTS_COLONETTE,
  SiteAttributes.ARTEFACTS_DOORFRAME,
  SiteAttributes.ARTEFACTS_STATUARY,
  SiteAttributes.ARTEFACTS_DECORATED_BLOCKS,
  SiteAttributes.ARTEFACTS_OTHER,
  SiteAttributes.ID_AMBIGUITY,
  SiteAttributes.IK_STARRED,
  SiteAttributes.IN_GAP_STUDY_AREA,
  SiteAttributes.IN_LIDAR_STUDY_AREA,
  SiteAttributes.TO_BE_INVESTIGATED,
  SiteAttributes.TO_BE_REMAPPED,
  SiteAttributes.TO_BE_REMOVED,
];

const regularAttributes = [
  SiteAttributes.ENGLISH_NAME,
  SiteAttributes.FRENCH_NAME,
  SiteAttributes.KHMER_NAME,
  SiteAttributes.ALTERNATIVE_NAME,
  SiteAttributes.ALTERNATIVE_KHMER_NAME,
  SiteAttributes.DESCRIPTION,
  SiteAttributes.CERAMICS_DETAILS,
  SiteAttributes.BUILD_MATERIAL_COMMENTS,
  SiteAttributes.ARTEFACTS_COMMENTS,
  SiteAttributes.DATABASING_COMMENTS,
  SiteAttributes.USER_CREATION,
  SiteAttributes.USER_MODIFICATION,
  SiteAttributes.STUDY_AREA,
  SiteAttributes.FEATURE_TYPE,
  SiteAttributes.ID_AMBIGUITY_DETAIL,
  SiteAttributes.IK_ID,
  SiteAttributes.MH_ID,
  SiteAttributes.BD_ID,
  SiteAttributes.DC_ID,
  SiteAttributes.COORDINATE_SOURCE,
  SiteAttributes.SITE_ID,
  SiteAttributes.LOCATED_BY,
  SiteAttributes.GROUND_VERIFIED_BY,
  SiteAttributes.CK_ID,
  SiteAttributes.GT_ID,
  SiteAttributes.CP_ID,
  SiteAttributes.GA_ID,
  SiteAttributes.JB_ID,
  SiteAttributes.EM_ID,
  SiteAttributes.PK_ID,
  SiteAttributes.IS_ID,
  SiteAttributes.DB_RESOLVED,
  SiteAttributes.DOCUMENTS,
  SiteAttributes.ARTEFACTS,
  SiteAttributes.INDIVIDUALS,
];

const dateAttributes = [
  SiteAttributes.VERIFICATION_DATE,
  SiteAttributes.CREATION_DATE,
  SiteAttributes.MODIFICATION_DATE,
];

/**
 * Site
 */
export class Site extends TypedFeature<ISite> {
  constructor(site: GeoJSONFeature) {
    super();
    this.initializeFeature(site);
  }

  private initializeFeature(site: GeoJSONFeature): void {
    const feature = new GeoJSON().readFeature(site) as Feature;
    this.setGeometry(feature.getGeometry());
    this.setAttributes(site.properties as ISite);
  }

  /**
   * Set the attributes and values.
   * @param attributes - The site attributes
   */
  private setAttributes(attributes: ISite): void {
    Object.entries(attributes).forEach(([key, value]) => {
      const attribute = key as SiteAttributes;
      if (!value) {
        this.set(attribute, undefined);
      } else {
        if (booleanAttributes.includes(attribute)) {
          this.set(attribute, Boolean(value));
        } else if (dateAttributes.includes(attribute)) {
          const date = new Date(value);
          this.set(attribute, date);
        } else if (regularAttributes.includes(attribute)) {
          this.set(attribute, value);
        }
      }
    });
  }

  public override clone(): Site {
    const geoJSON = new GeoJSON();
    const featureGeoJSON = geoJSON.writeFeatureObject(this);
    return new Site(featureGeoJSON);
  }

  public getGeoJSON(): GeoJSONFeature {
    const geoJSON = new GeoJSON();
    return geoJSON.writeFeatureObject(this);
  }
}
