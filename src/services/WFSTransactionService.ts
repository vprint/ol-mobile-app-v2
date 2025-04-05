import { Feature } from 'ol';
import { TransactionResponse, WriteTransactionOptions } from 'ol/format/WFS';
import { Circle } from 'ol/geom';
import { fromCircle } from 'ol/geom/Polygon';
import { TransactionMode } from 'src/enums/map.enum';
import WFS from 'ol/format/WFS';
import NotificationService from './notifier/Notifier';
import { UserMessage } from 'src/enums/user-messages.enum';

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
    feature: Feature,
    options: WriteTransactionOptions
  ): Node {
    let wfsSerializer: Node | undefined;

    switch (mode) {
      case TransactionMode.INSERT:
        wfsSerializer = new WFS().writeTransaction([feature], [], [], options);
        break;
      case TransactionMode.UPDATE:
        wfsSerializer = new WFS().writeTransaction([], [feature], [], options);
        break;
      case TransactionMode.DELETE:
        wfsSerializer = new WFS().writeTransaction([], [], [feature], options);
        break;
    }

    return wfsSerializer;
  }

  /**
   * Analyse result and push information notification.
   * @param result - OL transaction result.
   * @param mode - Transaction mode.
   * @returns Transaction result as boolean.
   */
  public checkResult(result: TransactionResponse, mode: TransactionMode): void {
    const checkParameters = this.getCheckParameters(result)[mode];
    this.pushNotification(checkParameters.check(), checkParameters);
  }

  /**
   * Push a notification based on the success or the failure of the transaction.
   * @param isSuccess - Is the transaction a success ?
   * @param msg - The notification title and text.
   */
  private pushNotification(
    isSuccess: boolean,
    checkParameters: ICheckingItem
  ): void {
    const msg = isSuccess
      ? checkParameters.message.success
      : checkParameters.message.error;

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
      [TransactionMode.INSERT]: this.getInsertParameters(transactionResult),
      [TransactionMode.UPDATE]: this.getUpdateParameters(transactionResult),
      [TransactionMode.DELETE]: this.getDeleteParameters(transactionResult),
    };
  }

  private getInsertParameters(
    transactionResult: TransactionResponse | undefined
  ): ICheckingItem {
    return {
      message: {
        success: {
          title: UserMessage.GENERIC.SUCCESS,
          text: UserMessage.WFS.INSERT.SUCCESS,
        },
        error: {
          title: UserMessage.GENERIC.FAIL,
          text: UserMessage.WFS.INSERT.FAIL,
        },
      },
      check: () =>
        transactionResult !== undefined &&
        transactionResult.transactionSummary.totalInserted >= 1,
    };
  }

  private getUpdateParameters(
    transactionResult: TransactionResponse | undefined
  ): ICheckingItem {
    return {
      message: {
        success: {
          title: UserMessage.GENERIC.SUCCESS,
          text: UserMessage.WFS.UPDATE.SUCCESS,
        },
        error: {
          title: UserMessage.GENERIC.FAIL,
          text: UserMessage.WFS.UPDATE.FAIL,
        },
      },
      check: () =>
        transactionResult !== undefined &&
        transactionResult.transactionSummary.totalUpdated >= 1,
    };
  }

  private getDeleteParameters(
    transactionResult: TransactionResponse | undefined
  ): ICheckingItem {
    return {
      message: {
        success: {
          title: UserMessage.GENERIC.SUCCESS,
          text: UserMessage.WFS.DELETE.SUCCESS,
        },
        error: {
          title: UserMessage.GENERIC.FAIL,
          text: UserMessage.WFS.DELETE.FAIL,
        },
      },
      check: () =>
        transactionResult !== undefined &&
        transactionResult.transactionSummary.totalDeleted >= 1,
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
