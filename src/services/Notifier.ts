import Notify, { NotifyStatus } from 'simple-notify';
import 'simple-notify/dist/simple-notify.css';

enum NotifyStatusEnum {
  ERROR = 'error',
  WARNING = 'warning',
  SUCCESS = 'success',
  INFO = 'info',
}

class NotificationService {
  private static readonly DEFAULT_TIMEOUT = 3000;
  private static readonly ERROR_TIMEOUT = 10000;

  /**
   * Create a new notification
   * @param mode Notification mode
   * @param text Text of the notification
   * @param title Title of the notification
   * @param timout Notification delay
   */
  private createNotify(
    mode: NotifyStatus,
    text: string,
    title: string,
    timout: number
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
      notificationsPadding: 30,
    });

    // Custom padding
    notification.container.style.setProperty(
      '--sn-notifications-padding',
      '20px 20px 40px 20px'
    );
  }

  public pushError(title: string, text: string): void {
    this.createNotify(
      NotifyStatusEnum.ERROR,
      text,
      title,
      NotificationService.ERROR_TIMEOUT
    );
  }

  public pushWarning(title: string, text: string): void {
    this.createNotify(
      NotifyStatusEnum.WARNING,
      text,
      title,
      NotificationService.DEFAULT_TIMEOUT
    );
  }

  public pushSuccess(title: string, text: string): void {
    this.createNotify(
      NotifyStatusEnum.SUCCESS,
      text,
      title,
      NotificationService.DEFAULT_TIMEOUT
    );
  }

  public pushInfo(title: string, text: string): void {
    this.createNotify(
      NotifyStatusEnum.INFO,
      text,
      title,
      NotificationService.DEFAULT_TIMEOUT
    );
  }
}

export default NotificationService;
