import { defineStore } from 'pinia';
import NotificationService, {
  NotifyStatus,
} from 'src/services/notifier/Notifier';
import { NotifyStatus as INotifyStatus } from 'simple-notify';
import { useDebounceFn } from '@vueuse/core';
import { isEqual } from 'lodash';

interface INotification {
  status: INotifyStatus;
  title?: string;
  text: string;
}

const DEBOUNCE_TIME = 3000;

export const useNotificationStore = defineStore('notification', () => {
  const notifier = new NotificationService();

  let historyNotification: INotification | undefined = undefined;

  /**
   * Push the notification.
   * @param notification - The notification to push.
   */
  function _pushNotification(notification: INotification): void {
    switch (notification.status) {
      case NotifyStatus.SUCCESS:
        notifier.pushSuccess(notification.text, notification.title);
        break;
      case NotifyStatus.WARNING:
        notifier.pushWarning(notification.text, notification.title);
        break;
      case NotifyStatus.ERROR:
        notifier.pushError(notification.text, notification.title);
        break;
      case NotifyStatus.INFO:
        notifier.pushInfo(notification.text, notification.title);
        break;
    }

    historyNotification = notification;
  }

  /**
   * Push notification with debounce
   */
  const _debouncedPush: (notification: INotification) => void = useDebounceFn(
    (notification: INotification) => {
      _pushNotification(notification);
    },
    DEBOUNCE_TIME
  );

  /**
   * Pushes a notification with debounce if it's similar to the previous one,
   * otherwise pushes the notification immediately without debounce.
   * @param status - The notification status
   * @param text - The notification message text
   * @param title - The notification title
   */
  const _manageNotification = (
    status: NotifyStatus,
    text: string,
    title?: string
  ): void => {
    const newNotification: INotification = {
      status: status,
      title: title,
      text: text,
    };

    if (isEqual(historyNotification, newNotification)) {
      _debouncedPush(newNotification);
    } else {
      _pushNotification(newNotification);
    }
  };

  /**
   * Push a success notification.
   * @param text - The notification text.
   * @param title - The notification title.
   */
  function pushSuccess(text: string, title?: string): void {
    _manageNotification(NotifyStatus.SUCCESS, text, title);
  }

  /**
   * Push a warning notification.
   * @param text - The notification text.
   * @param title - The notification title.
   */
  function pushWarning(text: string, title?: string): void {
    _manageNotification(NotifyStatus.WARNING, text, title);
  }

  /**
   * Push an error notification.
   * @param text - The notification text.
   * @param title - The notification title.
   */
  function pushError(text: string, title?: string): void {
    _manageNotification(NotifyStatus.ERROR, text, title);
  }

  /**
   * Push an information notification.
   * @param text - The notification text.
   * @param title - The notification title.
   */
  function pushInfo(text: string, title?: string): void {
    _manageNotification(NotifyStatus.INFO, text, title);
  }

  return {
    pushSuccess,
    pushWarning,
    pushError,
    pushInfo,
  };
});
