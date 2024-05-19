import { IArtefact } from './IArtefact';
import { IBuildMaterial } from './IBuildMaterial';
import { IDocument } from './IDocument';
import { IResearcher } from './IResearcher';

export interface ISite {
  siteId: number;
  englishName: string;
  frenchName: string;
  khmerName: string;
  alternativeName: string;
  alternativeKhmerName: string;
  description: string;
  ikId: number;
  mhId: number;
  verified: boolean;
  verificationDate: string;
  locatedBy: IResearcher;
  ceramicsDetails: string;
  ceramics: boolean;
  buildMaterialComments: string;
  buildMaterials: IBuildMaterial[];
  artefactsComments: string;
  looted: boolean;
  cultivated: boolean;
  cleared: boolean;
  threatened: boolean;
  databasingComments: string;
  creationDate: string;
  modificationDate: string;
  userCreation: string;
  userModification: string;
  studyArea: string;
  featureType: string;
  documents: IDocument[];
  artefacts: IArtefact[];
  researchers: IResearcher[];
}

export interface ISiteList {
  site_id: number;
  site_name: string;
}
