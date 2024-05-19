import { IBuildMaterial } from 'src/interface/IBuildMaterial';

/**
 * Build material
 */
export class BuildMaterial {
  private _buildMaterialId: number;
  public buildMaterialName: string;

  constructor(partialEntity: IBuildMaterial) {
    this._buildMaterialId = partialEntity.buildMaterialId;
    this.buildMaterialName = partialEntity.buildMaterialName;
  }

  get buildMaterialId(): number {
    return this._buildMaterialId;
  }
}
