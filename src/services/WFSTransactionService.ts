import { Feature } from 'ol';
import { TransactionResponse, WriteTransactionOptions } from 'ol/format/WFS';
import { Circle } from 'ol/geom';
import { fromCircle } from 'ol/geom/Polygon';
import { TransactionMode } from 'src/enums/transaction.enum';
import WFS from 'ol/format/WFS';
import NotificationService from './Notifier';

interface ICheckingMessage {
  title: string;
  text: string;
}

interface ICheckingItem {
  message: {
    success: ICheckingMessage;
    error: ICheckingMessage;
  };
  check: () => boolean;
}

type ICheckingParameters = Record<TransactionMode, ICheckingItem>;

/**
 * This class provides methods to handle WFS transactions.
 */
class WFSTransactionService {
  /**
   * Write the transaction for a give mode.
   * @param mode - Transaction mode.
   * @param feature - Feature to create / update / delete.
   * @param options - Transaction options.
   * @returns Transaction
   */
  public writeTransactionByMode(
    mode: TransactionMode,
    feature: Feature | undefined,
    options: WriteTransactionOptions
  ): Node | undefined {
    let wfsSerializer: Node | undefined;

    if (feature) {
      switch (mode) {
        case TransactionMode.INSERT:
          wfsSerializer = new WFS().writeTransaction(
            [feature],
            [],
            [],
            options
          );
          break;
        case TransactionMode.UPDATE:
          wfsSerializer = new WFS().writeTransaction(
            [],
            [feature],
            [],
            options
          );
          break;
        case TransactionMode.DELETE:
          wfsSerializer = new WFS().writeTransaction(
            [],
            [],
            [feature],
            options
          );
          break;
      }
    } else {
      wfsSerializer = undefined;
    }

    return wfsSerializer;
  }

  /**
   * Analyze result and push
   * @param result - OL transaction result.
   * @param mode - Transaction mode.
   * @returns Transaction result as boolean.
   */
  public checkResult(
    result: Document | Element | object | string | undefined,
    mode: TransactionMode
  ): boolean {
    const transactionResult = new WFS().readTransactionResponse(result);
    const checkParameters = this.getCheckParameters(transactionResult)[mode];
    this.pushNotification(checkParameters.check(), checkParameters);
    return checkParameters.check();
  }

  /**
   * Push a notification based on the success or the failure of the transaction.
   * @param isSuccess - Is the transaction a success ?
   * @param msg - The notification title and text.
   */
  private pushNotification(
    isSuccess: boolean,
    chackParameters: ICheckingItem
  ): void {
    const msg = isSuccess
      ? chackParameters.message.success
      : chackParameters.message.error;

    isSuccess
      ? new NotificationService().pushSuccess(msg.title, msg.text)
      : new NotificationService().pushError(msg.title, msg.text);
  }

  /**
   * Get the check parameters for the result analysis.
   * @param transactionResult - OL transaction result.
   * @returns
   */
  private getCheckParameters(
    transactionResult: TransactionResponse | undefined
  ): ICheckingParameters {
    return {
      [TransactionMode.INSERT]: {
        message: {
          success: { title: 'Succès', text: 'Entité inserée avec succès' },
          error: { title: 'Echec', text: "Echec de l'insertion" },
        },
        check: () =>
          transactionResult !== undefined &&
          transactionResult.transactionSummary.totalInserted >= 1,
      },

      [TransactionMode.UPDATE]: {
        message: {
          success: {
            title: 'Succès',
            text: 'Entité mise à jour avec succès',
          },
          error: { title: 'Echec', text: 'Echec de la mise à jour' },
        },
        check: () =>
          transactionResult !== undefined &&
          transactionResult.transactionSummary.totalUpdated >= 1,
      },

      [TransactionMode.DELETE]: {
        message: {
          success: {
            title: 'Suppression',
            text: 'Entité supprimée avec succès',
          },
          error: { title: 'Echec', text: 'Echec de la suppression' },
        },
        check: () =>
          transactionResult !== undefined &&
          transactionResult.transactionSummary.totalDeleted >= 1,
      },
    };
  }

  /**
   * Get the inserted ID.
   * @param result - Result of the insert transaction.
   * @returns New feature ID.
   */
  public getInsertedId(
    result: Document | Element | object | string | undefined
  ): string | undefined {
    const transactionResult = new WFS().readTransactionResponse(result);
    const RawId = transactionResult?.insertIds[0];
    const parts = RawId?.split('.');
    const formattedId = parts ? parts[1] : undefined;
    return formattedId;
  }

  /**
   * Format the feature to WFS standard.
   * @param feature - The OL feature to format.
   * @returns Formatted feature
   */
  public formatFeature(
    feature: Feature | undefined,
    mode: TransactionMode
  ): Feature | undefined {
    const formattedFeature = feature?.clone();
    const geom = formattedFeature?.getGeometry();

    // Particular case of circles.
    if (geom instanceof Circle) {
      const polygonGeom = fromCircle(geom, 64);
      formattedFeature?.setGeometry(polygonGeom);
    }

    // Create the ID.
    if (mode === TransactionMode.INSERT) {
      formattedFeature?.set('geom', formattedFeature.getGeometry());
    } else {
      formattedFeature?.setId(feature?.getId());
      formattedFeature?.setGeometryName('geom');
      formattedFeature?.unset('id');
    }

    return formattedFeature;
  }
}

export default WFSTransactionService;
