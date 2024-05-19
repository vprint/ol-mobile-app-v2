import { IArtefact } from 'src/interface/IArtefact';

/**
 * Artefact
 */
export class Artefact {
  private _artefactId: number;
  public artefactName: string;

  constructor(partialEntity: IArtefact) {
    this._artefactId = partialEntity.artefactId;
    this.artefactName = partialEntity.artefactName;
  }

  get artefactId(): number {
    return this._artefactId;
  }
}
