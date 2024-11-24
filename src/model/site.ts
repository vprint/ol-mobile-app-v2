import { format } from 'date-fns';
import { ISite } from 'src/interface/ISite';

/**
 * Site
 */
export class Site {
  public siteId: number;
  public englishName?: string;
  public frenchName?: string;
  public khmerName?: string;
  public alternativeName?: string;
  public alternativeKhmerName?: string;
  public description?: string;
  public verified?: boolean;
  public ceramicsDetails?: string;
  public ceramics?: boolean;
  public buildMaterialComments?: string;
  public artefactsComments?: string;
  public looted?: boolean;
  public cultivated?: boolean;
  public cleared?: boolean;
  public threatened?: boolean;
  public databasingComments?: string;
  public userCreation?: string;
  public userModification?: string;
  public featureType?: string;
  public locatedBy?: number;
  public groundVerifiedBy?: number;
  public materialSandstone?: boolean;
  public materialPinkSandstone?: boolean;
  public materialLaterite?: boolean;
  public materialBrick?: boolean;
  public materialThmaphnom?: boolean;
  public materialOther?: boolean;
  public artefactsPedestal?: boolean;
  public artefactsColonette?: boolean;
  public artefactsDoorframe?: boolean;
  public artefactsStatuary?: boolean;
  public artefactsDecoratedBlocks?: boolean;
  public artefactsOther?: boolean;
  public idAmbiguity?: boolean;
  public idAmbiguityDetail?: string;
  public ckId?: number;
  public ikId?: string;
  public mhId?: string;
  public ikStarred?: boolean;
  public bdId?: string;
  public gtId?: number;
  public cpId?: number;
  public dcId?: string;
  public gaId?: number;
  public jbId?: number;
  public emId?: number;
  public pkId?: number;
  public isId?: number;
  public coordinateSource?: string;
  public inGapStudyArea?: boolean;
  public inLidarStudyArea?: boolean;
  public toBeInvestigated?: boolean;
  public toBeRemapped?: boolean;
  public toBeRemoved?: boolean;
  public dbResolved?: number;
  public creationDate?: string;
  public verificationDate?: string;
  public modificationDate?: string;

  constructor(partialEntity: ISite | Site) {
    this.siteId =
      partialEntity instanceof Site
        ? partialEntity.siteId
        : Number(partialEntity.siteId);
    this.englishName = partialEntity.englishName ?? undefined;
    this.frenchName = partialEntity.frenchName ?? undefined;
    this.khmerName = partialEntity.khmerName ?? undefined;
    this.alternativeName = partialEntity.alternativeName ?? undefined;
    this.alternativeKhmerName = partialEntity.alternativeKhmerName ?? undefined;
    this.description = partialEntity.description ?? undefined;
    this.ikId = partialEntity.ikId ?? undefined;
    this.mhId = partialEntity.mhId ?? undefined;
    this.verified = Boolean(partialEntity.verified);
    this.locatedBy = partialEntity.locatedBy ?? undefined;
    this.ceramicsDetails = partialEntity.ceramicsDetails ?? undefined;
    this.ceramics = Boolean(partialEntity.ceramics);
    this.buildMaterialComments =
      partialEntity.buildMaterialComments ?? undefined;
    this.artefactsComments = partialEntity.artefactsComments ?? undefined;
    this.looted = Boolean(partialEntity.looted);
    this.cultivated = Boolean(partialEntity.cultivated);
    this.cleared = Boolean(partialEntity.cleared);
    this.threatened = Boolean(partialEntity.threatened);
    this.databasingComments = partialEntity.databasingComments ?? undefined;
    this.userCreation = partialEntity.userCreation ?? undefined;
    this.userModification = partialEntity.userModification ?? undefined;
    this.featureType = partialEntity.featureType ?? undefined;
    this.groundVerifiedBy = partialEntity.groundVerifiedBy ?? undefined;
    this.materialSandstone = partialEntity.materialSandstone ?? undefined;
    this.materialPinkSandstone =
      partialEntity.materialPinkSandstone ?? undefined;
    this.materialLaterite = partialEntity.materialLaterite ?? undefined;
    this.materialBrick = partialEntity.materialBrick ?? undefined;
    this.materialThmaphnom = partialEntity.materialThmaphnom ?? undefined;
    this.materialOther = partialEntity.materialOther ?? undefined;
    this.artefactsPedestal = partialEntity.artefactsPedestal ?? undefined;
    this.artefactsColonette = partialEntity.artefactsColonette ?? undefined;
    this.artefactsDoorframe = partialEntity.artefactsDoorframe ?? undefined;
    this.artefactsStatuary = partialEntity.artefactsStatuary ?? undefined;
    this.artefactsDecoratedBlocks =
      partialEntity.artefactsDecoratedBlocks ?? undefined;
    this.artefactsOther = partialEntity.artefactsOther ?? undefined;
    this.idAmbiguity = partialEntity.idAmbiguity ?? undefined;
    this.idAmbiguityDetail = partialEntity.idAmbiguityDetail ?? undefined;
    this.ckId = partialEntity.ckId ?? undefined;
    this.ikId = partialEntity.ikId ?? undefined;
    this.mhId = partialEntity.mhId ?? undefined;
    this.ikStarred = partialEntity.ikStarred ?? undefined;
    this.bdId = partialEntity.bdId ?? undefined;
    this.gtId = partialEntity.gtId ?? undefined;
    this.cpId = partialEntity.cpId ?? undefined;
    this.dcId = partialEntity.dcId ?? undefined;
    this.gaId = partialEntity.gaId ?? undefined;
    this.jbId = partialEntity.jbId ?? undefined;
    this.emId = partialEntity.emId ?? undefined;
    this.pkId = partialEntity.pkId ?? undefined;
    this.isId = partialEntity.isId ?? undefined;
    this.coordinateSource = partialEntity.coordinateSource ?? undefined;
    this.inGapStudyArea = partialEntity.inGapStudyArea ?? undefined;
    this.inLidarStudyArea = partialEntity.inLidarStudyArea ?? undefined;
    this.toBeInvestigated = partialEntity.toBeInvestigated ?? undefined;
    this.toBeRemapped = partialEntity.toBeRemapped ?? undefined;
    this.toBeRemoved = partialEntity.toBeRemoved ?? undefined;
    this.dbResolved = partialEntity.dbResolved ?? undefined;

    this.creationDate = partialEntity.creationDate
      ? format(partialEntity.creationDate, 'yyyy/MM/dd')
      : undefined;

    this.modificationDate = partialEntity.modificationDate
      ? format(partialEntity.modificationDate, 'yyyy/MM/dd')
      : undefined;

    this.verificationDate = partialEntity.verificationDate
      ? format(partialEntity.verificationDate, 'yyyy/MM/dd')
      : undefined;
  }

  /**
   * Clone the site
   * @returns new site instance
   */
  public clone(): Site {
    return new Site(this);
  }
}
