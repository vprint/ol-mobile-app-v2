import { IArtefact } from './IArtefact';
import { IDocument } from './IDocument';
import { IIndividual } from './IIndividual';

export interface ISite {
  siteId: number;
  englishName: string;
  frenchName: string;
  khmerName: string;
  alternativeName: string;
  alternativeKhmerName: string;
  description: string;
  verified: boolean;
  verificationDate: Date;
  locatedBy: number;
  ceramicsDetails: string;
  ceramics: boolean;
  buildMaterialComments: string;
  artefactsComments: string;
  looted: boolean;
  cultivated: boolean;
  cleared: boolean;
  threatened: boolean;
  databasingComments: string;
  creationDate: Date;
  modificationDate: Date;
  userCreation: string;
  userModification: string;
  studyArea: string;
  featureType: string;
  documents: IDocument[];
  artefacts: IArtefact[];
  individuals: IIndividual;
  groundVerifiedBy: number;
  materialSandstone: boolean;
  materialPinkSandstone: boolean;
  materialLaterite: boolean;
  materialBrick: boolean;
  materialThmaphnom: boolean;
  materialOther: boolean;
  artefactsPedestal: boolean;
  artefactsColonette: boolean;
  artefactsDoorframe: boolean;
  artefactsStatuary: boolean;
  artefactsDecoratedBlocks: boolean;
  artefactsOther: boolean;
  idAmbiguity: boolean;
  idAmbiguityDetail: string;
  ikId: string;
  mhId: string;
  ckId: number;
  ikStarred: boolean;
  bdId: string;
  gtId: number;
  cpId: number;
  dcId: string;
  gaId: number;
  jbId: number;
  emId: number;
  pkId: number;
  isId: number;
  coordinateSource: string;
  inGapStudyArea: boolean;
  inLidarStudyArea: boolean;
  toBeInvestigated: boolean;
  toBeRemapped: boolean;
  toBeRemoved: boolean;
  dbResolved: number;
}

export interface ISiteList {
  siteId: number;
  siteName: string;
}
