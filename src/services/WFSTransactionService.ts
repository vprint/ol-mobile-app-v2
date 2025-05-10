import Feature from 'ol/Feature';
import { TransactionMode } from 'src/enums/map.enum';
import WFS, {
  TransactionResponse,
  WriteTransactionOptions,
} from 'ol/format/WFS';
import Circle from 'ol/geom/Circle';
import { fromCircle } from 'ol/geom/Polygon';

class WFSTransactionService {
  private feature: Feature;
  private mode: TransactionMode;
  private options: WriteTransactionOptions;

  constructor(
    feature: Feature,
    mode: TransactionMode,
    options: WriteTransactionOptions
  ) {
    this.feature = WFSTransactionService.formatFeature(feature, mode);
    this.mode = mode;
    this.options = options;
  }

  private getInsertTransaction(): Node {
    return new WFS().writeTransaction([this.feature], [], [], this.options);
  }

  private getUpdateTransaction(): Node {
    return new WFS().writeTransaction([], [this.feature], [], this.options);
  }

  private getDeleteTransaction(): Node {
    return new WFS().writeTransaction([], [], [this.feature], this.options);
  }

  public getTransaction(): string {
    let transaction = undefined;

    switch (this.mode) {
      case TransactionMode.INSERT:
        transaction = this.getInsertTransaction();
        break;
      case TransactionMode.UPDATE:
        transaction = this.getUpdateTransaction();
        break;
      case TransactionMode.DELETE:
        transaction = this.getDeleteTransaction();
        break;
    }

    const xmlTransaction = new XMLSerializer().serializeToString(transaction);
    return xmlTransaction;
  }

  /**
   * Is the transaction successfull ?
   * @param result - The raw transaction result.
   */
  public isSuccess(result: string | undefined): boolean {
    const transactionResponse = new WFS().readTransactionResponse(result);
    return this.isTransactionSucessfull(transactionResponse);
  }

  /**
   * Is the transaction sucessfull ?
   * @param transactionResult - The transaction result
   */
  private isTransactionSucessfull(
    transactionResult: TransactionResponse | undefined
  ): boolean {
    let isValid = false;

    if (transactionResult !== undefined) {
      isValid =
        transactionResult.transactionSummary.totalInserted >= 1 ||
        transactionResult.transactionSummary.totalDeleted >= 1 ||
        transactionResult.transactionSummary.totalUpdated >= 1;
    }

    return isValid;
  }

  /**
   * Format the feature to WFS standard.
   * @param feature - The OL feature to format.
   * @returns Formatted feature
   */
  public static formatFeature(
    feature: Feature,
    mode: TransactionMode
  ): Feature {
    const formattedFeature = feature.clone();
    const geom = formattedFeature.getGeometry();

    // Particular case of circles.
    if (geom instanceof Circle) {
      const polygonGeom = fromCircle(geom, 64);
      formattedFeature.setGeometry(polygonGeom);
    }

    // Create the geom field for insert.
    if (mode === TransactionMode.INSERT) {
      formattedFeature.set('geom', formattedFeature.getGeometry());
    }

    // Set the id for update and delete.
    if (mode != TransactionMode.INSERT) {
      formattedFeature.setId(feature.getId());
      formattedFeature.setGeometryName('geom');
      formattedFeature.unset('id');
    }

    return formattedFeature;
  }
}

export default WFSTransactionService;
