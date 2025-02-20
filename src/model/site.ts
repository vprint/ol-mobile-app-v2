import TypedFeature from 'src/services/Feature';
import { ISite } from 'src/interface/ISite';
import { format } from 'date-fns';
import { ObjectWithGeometry } from 'ol/Feature';
import { SiteAttributes } from 'src/enums/site-type.enums';

class Site extends TypedFeature<ISite> {
  private static readonly DATE_FORMAT = 'yyyy/MM/dd';

  private static readonly FIELDS_TYPE = {
    dateFields: [
      SiteAttributes.CREATION_DATE,
      SiteAttributes.MODIFICATION_DATE,
      SiteAttributes.VERIFICATION_DATE,
    ] as const,
    booleanFields: [
      SiteAttributes.VERIFIED,
      SiteAttributes.CERAMICS,
      SiteAttributes.LOOTED,
      SiteAttributes.CULTIVATED,
      SiteAttributes.CLEARED,
      SiteAttributes.THREATENED,
    ] as const,
  };

  constructor(data: ObjectWithGeometry) {
    const site = Site.prepareData(data as ISite);
    super(site);
  }

  public get siteId(): number {
    return this.attributes.siteId;
  }

  override clone(): Site {
    return new Site({
      ...this.getProperties(),
      geometry: this.getGeometry()?.clone(),
    });
  }

  /**
   * Format the raw data.
   * @param data - Site data.
   * @returns A copy of the formatted data.
   */
  private static prepareData(data: ISite): ISite {
    const formatedDate = Site.formatDate({ ...data });
    const formatedBoolean = Site.formatBoolean(formatedDate);
    return formatedBoolean;
  }

  /**
   * Format the date to the application standard.
   * @param site - Site data.
   * @returns Data with updated date.
   */
  private static formatDate(site: ISite): ISite {
    this.FIELDS_TYPE.dateFields.forEach((dateField) => {
      site[dateField] = site[dateField]
        ? format(site[dateField], this.DATE_FORMAT)
        : undefined;
    });
    return site;
  }

  /**
   * Format the json boolean data (e.g string 'false' and 'true') to real boolean values.
   * @param site - Site data.
   * @returns Data with boolean values.
   */
  private static formatBoolean(site: ISite): ISite {
    this.FIELDS_TYPE.booleanFields.forEach((booleanFields) => {
      site[booleanFields] = site[booleanFields]
        ? Boolean(site[booleanFields])
        : false;
    });
    return site;
  }
}

export default Site;
