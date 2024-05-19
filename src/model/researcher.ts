import { IResearcher } from 'src/interface/IResearcher';

/**
 * Researcher
 */
export class Researcher {
  private _researcherId: number;
  public firstName: string;
  public lastName: string;
  public fullName: string;

  constructor(partialEntity: IResearcher) {
    this._researcherId = partialEntity.researcherId;
    this.firstName = partialEntity.firstName;
    this.lastName = partialEntity.lastName;
    this.fullName = `${partialEntity.firstName} ${partialEntity.lastName}`;
  }

  get researcherId(): number {
    return this._researcherId;
  }
}
