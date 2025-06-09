import TypedFeature from 'src/services/Feature';
import { ISite } from 'src/interface/ISite';
import { format, parse } from 'date-fns';
import { ObjectWithGeometry } from 'ol/Feature';
import { SiteAttributes } from 'src/enums/site-type.enums';

class Site extends TypedFeature<ISite> {
  private static readonly FIELDS_TYPE = {
    dateFields: [
      SiteAttributes.CREATION_DATE,
      SiteAttributes.MODIFICATION_DATE,
      SiteAttributes.GROUND_VERIFIED_DATE,
    ] as const,
    booleanFields: [
      SiteAttributes.GROUND_VERIFIED,
      SiteAttributes.CERAMICS,
      SiteAttributes.LOOTED,
      SiteAttributes.CULTIVATED,
      SiteAttributes.CLEARED,
      SiteAttributes.THREATENED,
    ] as const,
  };

  constructor(data: ObjectWithGeometry, formatData = true) {
    const site = formatData ? Site.prepareData(data as ISite) : data;
    super(site);
  }

  public get siteId(): number {
    return this.attributes[SiteAttributes.SITE_ID];
  }

  override clone(): Site {
    return new Site(
      {
        ...this.getProperties(),
        geometry: this.getGeometry()?.clone(),
      },
      false
    );
  }

  /**
   * Format the site to be OGC WFS conveniant.
   * @returns A 'WFS ready' feature.
   */
  public getWFSFeature(): Site {
    const wfsFeature = this.clone();

    wfsFeature.setId(this.siteId);
    wfsFeature.setGeometryName('geom');
    wfsFeature.unset('id');

    wfsFeature.setProperties(
      Site.formatDate(
        wfsFeature.getProperties(),
        'yyyy/MM/dd',
        "yyyy-MM-dd'T'HH:mm:ssXXX"
      )
    );

    return wfsFeature;
  }

  /**
   * Format the raw data.
   * @param data - Site data.
   * @returns A copy of the formatted data.
   */
  private static prepareData(data: ISite): ISite {
    const formatedDate = Site.formatDate(
      { ...data },
      'yyyy-MM-dd HH:mm:ss',
      'yyyy/MM/dd'
    );
    return Site.formatBoolean(formatedDate);
  }

  /**
   * Format the date to the application standard.
   * @param site - Site data.
   * @param inputDateFormat - The input data format.
   * @param outputDateFormat - The output data format.
   */
  private static formatDate(
    site: ISite,
    inputDateFormat: string,
    outputDateFormat: string
  ): ISite {
    this.FIELDS_TYPE.dateFields.forEach((dateField) => {
      if (site[dateField]) {
        const parsedDate = parse(site[dateField], inputDateFormat, new Date());
        site[dateField] = format(parsedDate, outputDateFormat);
      }
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
      site[booleanFields] = !!site[booleanFields];
    });
    return site;
  }
}

export default Site;
