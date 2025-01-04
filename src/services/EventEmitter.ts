interface IEventEmitter<IEventList extends Record<string, unknown[]>> {
  on<IEvent extends keyof IEventList>(
    eventName: IEvent,
    handler: (...args: IEventList[IEvent]) => void
  ): void;

  off<IEvent extends keyof IEventList>(eventName: IEvent): void;

  emit<IEvent extends keyof IEventList>(
    eventName: IEvent,
    ...args: IEventList[IEvent]
  ): void;
}

/**
 * provides event registration, removal, and emission.
 *
 * @example
 * ```
 * type UserEvents = {
 *   'userLoggedIn': [username: string, timestamp: Date];
 *   'dataUpdated': [newData: object];
 * }
 *
 * const emitter = new EventEmitter<UserEvents>();
 * emitter.on('userLoggedIn', (username, timestamp) => {
 *   console.log(`${username} logged in at ${timestamp}`);
 * });
 * ```
 *
 * Mainly writted by chatGPT and claude.ai. Prompt :
 *
 * `En typescript comment faire un classe exposant une fonction on ? si cette classe est instancié il sera ainsi possible 'd'écouter' les events de la classe (par exemple : exemple.on('error', etc...)`
 */
class EventEmitter<IEventList extends Record<string, unknown[]>>
  implements IEventEmitter<IEventList>
{
  private events: {
    [IEvent in keyof IEventList]?: ((...args: IEventList[IEvent]) => void)[];
  } = {};

  /**
   * Registers an event handler for the specified event.
   * If the event doesn't exist, it creates a new array of handlers.
   *
   * @param eventName - The name of the event to listen for.
   * @param handler - The callback function to execute when the event is emitted.
   */
  on<IEvent extends keyof IEventList>(
    eventName: IEvent,
    handler: (...args: IEventList[IEvent]) => void
  ): void {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName]?.push(handler);
  }

  /**
   * Removes the listener for the specified event.
   * @param eventName - The name of the event to remove all handlers from
   */
  off<IEvent extends keyof IEventList>(eventName: IEvent): void {
    if (this.events[eventName]) {
      this.events[eventName] = [];
    }
  }

  /**
   * Triggers all registered handlers for the specified event with the provided arguments.
   *
   * @param eventName - The name of the event to emit.
   * @param args - The arguments to pass to the event handlers.
   */
  emit<IEvent extends keyof IEventList>(
    eventName: IEvent,
    ...args: IEventList[IEvent]
  ): void {
    const handlers = this.events[eventName];
    if (handlers) {
      handlers.forEach((handler) => handler(...args));
    }
  }
}

export default EventEmitter;
