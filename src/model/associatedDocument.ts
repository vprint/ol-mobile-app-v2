import { IDocument } from 'src/interface/IDocument';

/**
 * Associated documents
 */
export class AssociatedDocument {
  private _documentId: number;
  public documentName: string;
  public documentType: string;

  constructor(partialEntity: IDocument) {
    this._documentId = partialEntity.documentId;
    this.documentName = partialEntity.documentName;
    this.documentType = partialEntity.documentType;
  }

  get documentId(): number {
    return this._documentId;
  }
}
