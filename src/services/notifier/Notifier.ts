import Notify, { NotifyStatus as INotifyStatus } from 'simple-notify';
import './Notifier.css';
import 'simple-notify/dist/simple-notify.css';

export enum NotifyStatus {
  ERROR = 'error',
  WARNING = 'warning',
  SUCCESS = 'success',
  INFO = 'info',
}

/**
 * This class provides basics success, warning, error and information notifications.
 * The notification must have at least a text, and may have a title.
 */
class NotificationService {
  private static readonly DEFAULT_TIMEOUT = 3000;
  private static readonly ERROR_TIMEOUT = 10000;

  /**
   * Create a new notification
   * @param mode - Notification mode
   * @param text - Text of the notification
   * @param title - Title of the notification
   * @param timout - Notification delay
   */
  private createNotify(
    mode: INotifyStatus,
    timout: number,
    text: string,
    title?: string
  ): void {
    const notification = new Notify({
      status: mode,
      title: title,
      text: text,
      speed: 300,
      showIcon: true,
      showCloseButton: true,
      autoclose: true,
      autotimeout: timout,
      position: 'right bottom',
    });

    this.setCustomPadding(notification);
  }

  /**
   * Set the notification padding to match with application style.
   * @param notification - notification The input notification
   */
  private setCustomPadding(notification: Notify): void {
    notification.container.style.setProperty(
      '--sn-notifications-padding',
      '20px 20px 40px 20px'
    );
  }

  public pushError(text: string, title?: string): void {
    this.createNotify(
      NotifyStatus.ERROR,
      NotificationService.ERROR_TIMEOUT,
      text,
      title
    );
  }

  public pushWarning(text: string, title?: string): void {
    this.createNotify(
      NotifyStatus.WARNING,
      NotificationService.DEFAULT_TIMEOUT,
      text,
      title
    );
  }

  public pushSuccess(text: string, title?: string): void {
    this.createNotify(
      NotifyStatus.SUCCESS,
      NotificationService.DEFAULT_TIMEOUT,
      text,
      title
    );
  }

  public pushInfo(text: string, title?: string): void {
    this.createNotify(
      NotifyStatus.INFO,
      NotificationService.DEFAULT_TIMEOUT,
      text,
      title
    );
  }
}

export default NotificationService;
