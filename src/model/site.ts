import { format } from 'date-fns';
import { Geometry } from 'ol/geom';
import { ISite } from 'src/interface/ISite';
import { Researcher } from './researcher';
import { BuildMaterial } from './buildMaterial';
import { Artefact } from './artefact';
import { AssociatedDocument } from './associatedDocument';

/**
 * Site
 */
export class Site {
  private _siteId: number;
  public englishName: string;
  public frenchName: string;
  public khmerName: string;
  public alternativeName: string;
  public alternativeKhmerName: string;
  public description: string;
  public ikId: number;
  public mhId: number;
  public verified: boolean;
  public researchers: Researcher[];
  public artefacts: Artefact[];
  public verificationDate: string;
  public locatedBy: Researcher;
  public ceramicsDetails: string;
  public ceramics: boolean;
  public buildMaterials: BuildMaterial[];
  public buildMaterialComments: string;
  public artefactsComments: string;
  public looted: boolean;
  public cultivated: boolean;
  public cleared: boolean;
  public threatened: boolean;
  public databasingComments: string;
  public creationDate: string;
  public modificationDate: string;
  public userCreation: string;
  public userModification: string;
  public featureType: string;
  public studyArea: string;
  public documents: AssociatedDocument[];
  public geom?: Geometry;

  constructor(partialEntity: ISite | Site) {
    this._siteId =
      partialEntity instanceof Site
        ? partialEntity._siteId
        : Number(partialEntity.siteId);
    this.englishName = partialEntity.englishName;
    this.frenchName = partialEntity.frenchName;
    this.khmerName = partialEntity.khmerName;
    this.alternativeName = partialEntity.alternativeName;
    this.alternativeKhmerName = partialEntity.alternativeKhmerName;
    this.description = partialEntity.description;
    this.ikId = Number(partialEntity.ikId);
    this.mhId = Number(partialEntity.mhId);
    this.verified = Boolean(partialEntity.verified);
    this.verificationDate = format(
      partialEntity.verificationDate,
      'yyyy/MM/dd'
    );
    this.locatedBy = new Researcher(partialEntity.locatedBy);
    this.ceramicsDetails = partialEntity.ceramicsDetails;
    this.ceramics = Boolean(partialEntity.ceramics);
    this.buildMaterials = partialEntity.buildMaterials.map(
      (buildMaterial) => new BuildMaterial(buildMaterial)
    );
    this.buildMaterialComments = partialEntity.buildMaterialComments;
    this.artefactsComments = partialEntity.artefactsComments;
    this.looted = Boolean(partialEntity.looted);
    this.cultivated = Boolean(partialEntity.cultivated);
    this.cleared = Boolean(partialEntity.cleared);
    this.threatened = Boolean(partialEntity.threatened);
    this.databasingComments = partialEntity.databasingComments;
    this.creationDate = format(partialEntity.creationDate, 'yyyy/MM/dd');
    this.modificationDate = format(
      partialEntity.modificationDate,
      'yyyy/MM/dd'
    );
    this.userCreation = partialEntity.userCreation;
    this.userModification = partialEntity.userModification;
    this.featureType = partialEntity.featureType;
    this.studyArea = partialEntity.studyArea;
    this.researchers = partialEntity.researchers.map(
      (researcher) => new Researcher(researcher)
    );
    this.artefacts = partialEntity.artefacts.map(
      (artefact) => new Artefact(artefact)
    );
    this.documents = partialEntity.documents.map(
      (document) => new AssociatedDocument(document)
    );
  }

  get siteId(): number {
    return this._siteId;
  }

  /**
   * Clone the site
   * @returns new site instance
   */
  public clone(): Site {
    return new Site(this);
  }
}
