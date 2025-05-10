import { SiteAttributes } from 'src/enums/site-type.enums';

export interface ISite {
  [SiteAttributes.SITE_ID]: number;
  [SiteAttributes.ENGLISH_NAME]: string | undefined;
  [SiteAttributes.FRENCH_NAME]: string | undefined;
  [SiteAttributes.KHMER_NAME]: string | undefined;
  [SiteAttributes.ALTERNATIVE_NAME]: string | undefined;
  [SiteAttributes.ALTERNATIVE_KHMER_NAME]: string | undefined;
  [SiteAttributes.DESCRIPTION]: string | undefined;
  [SiteAttributes.GROUND_VERIFIED]: boolean | undefined;
  [SiteAttributes.GROUND_VERIFIED_DATE]: string | undefined;
  [SiteAttributes.LOCATED_BY]: number | undefined;
  [SiteAttributes.CERAMICS_COMMENTS]: string | undefined;
  [SiteAttributes.CERAMICS]: boolean | undefined;
  [SiteAttributes.BUILD_MATERIAL_COMMENTS]: string | undefined;
  [SiteAttributes.ARTEFACTS_COMMENTS]: string | undefined;
  [SiteAttributes.LOOTED]: boolean | undefined;
  [SiteAttributes.CULTIVATED]: boolean | undefined;
  [SiteAttributes.CLEARED]: boolean | undefined;
  [SiteAttributes.THREATENED]: boolean | undefined;
  [SiteAttributes.DATABASING_COMMENTS]: string | undefined;
  [SiteAttributes.CREATION_DATE]: string | undefined;
  [SiteAttributes.MODIFICATION_DATE]: string | undefined;
  [SiteAttributes.USER_CREATION]: number | undefined;
  [SiteAttributes.USER_MODIFICATION]: number | undefined;
  [SiteAttributes.FEATURE_TYPE]: number | undefined;
  [SiteAttributes.GROUND_VERIFIED_BY]: number | undefined;
  [SiteAttributes.MATERIAL_SANDSTONE]: boolean | undefined;
  [SiteAttributes.MATERIAL_PINK_SANDSTONE]: boolean | undefined;
  [SiteAttributes.MATERIAL_LATERITE]: boolean | undefined;
  [SiteAttributes.MATERIAL_BRICK]: boolean | undefined;
  [SiteAttributes.MATERIAL_THMAPHNOM]: boolean | undefined;
  [SiteAttributes.MATERIAL_OTHER]: boolean | undefined;
  [SiteAttributes.ARTEFACTS_PEDESTAL]: boolean | undefined;
  [SiteAttributes.ARTEFACTS_COLONETTE]: boolean | undefined;
  [SiteAttributes.ARTEFACTS_DOORFRAME]: boolean | undefined;
  [SiteAttributes.ARTEFACTS_STATUARY]: boolean | undefined;
  [SiteAttributes.ARTEFACTS_DECORATED_BLOCKS]: boolean | undefined;
  [SiteAttributes.ARTEFACTS_OTHER]: boolean | undefined;
  [SiteAttributes.ID_AMBIGUITY]: boolean | undefined;
  [SiteAttributes.ID_AMBIGUITY_DETAIL]: string | undefined;
  [SiteAttributes.IK_ID]: string | undefined;
  [SiteAttributes.MH_ID]: string | undefined;
  [SiteAttributes.CK_ID]: number | undefined;
  [SiteAttributes.IK_STARRED]: boolean | undefined;
  [SiteAttributes.BD_ID]: string | undefined;
  [SiteAttributes.GT_ID]: number | undefined;
  [SiteAttributes.CP_ID]: number | undefined;
  [SiteAttributes.DC_ID]: string | undefined;
  [SiteAttributes.GA_ID]: number | undefined;
  [SiteAttributes.JB_ID]: number | undefined;
  [SiteAttributes.EM_ID]: number | undefined;
  [SiteAttributes.PK_ID]: number | undefined;
  [SiteAttributes.IS_ID]: number | undefined;
  [SiteAttributes.COORDINATE_SOURCE]: string | undefined;
  [SiteAttributes.IN_GAP_STUDY_AREA]: boolean | undefined;
  [SiteAttributes.IN_LIDAR_STUDY_AREA]: boolean | undefined;
  [SiteAttributes.TO_BE_INVESTIGATED]: boolean | undefined;
  [SiteAttributes.TO_BE_REMAPPED]: boolean | undefined;
  [SiteAttributes.TO_BE_REMOVED]: boolean | undefined;
  [SiteAttributes.DB_RESOLVED]: number | undefined;
}

export interface ISiteList {
  siteId: number;
  siteName: string;
}
