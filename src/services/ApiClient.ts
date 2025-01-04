import { ApiEvents } from 'src/enums/error-event.enum';
import EventEmitter from './EventEmitter';
import wretch from 'wretch';

type IApiEvents = {
  [K in ApiEvents]: [error: Error];
};

/**
 * API Client for handling HTTP requests.
 */
class ApiClient {
  private eventEmitter: EventEmitter<IApiEvents>;

  constructor() {
    this.eventEmitter = new EventEmitter<IApiEvents>();
  }

  /**
   * Fetch a JSON to the api.
   * @param endpoint - The endpoint to request.
   * @returns The fetched data.
   */
  public async getJSON<ObjectType>(
    endpoint: string
  ): Promise<ObjectType | undefined> {
    const response = await wretch(endpoint)
      .get()
      .badRequest((err) => this.eventEmitter.emit(ApiEvents.BAD_REQUEST, err))
      .unauthorized((err) =>
        this.eventEmitter.emit(ApiEvents.UNAUTHORIZED, err)
      )
      .forbidden((err) => this.eventEmitter.emit(ApiEvents.FORBIDDEN, err))
      .notFound((err) => this.eventEmitter.emit(ApiEvents.NOT_FOUND, err))
      .timeout((err) => this.eventEmitter.emit(ApiEvents.TIMEOUT, err))
      .internalError((err) =>
        this.eventEmitter.emit(ApiEvents.INTERNAL_ERROR, err)
      )
      .error(418, (err) => this.eventEmitter.emit(ApiEvents.ERROR, err))
      .fetchError((err) => this.eventEmitter.emit(ApiEvents.FETCH_ERROR, err))
      .json<ObjectType>()
      .catch((error) => {
        console.error(error.message);
        return undefined;
      });

    return response;
  }

  /**
   * Register an event listener for API errors
   * @param eventName - The type of error event to listen for
   * @param handler - The callback function to handle the error
   */
  public on<K extends ApiEvents>(
    eventName: K,
    handler: (...args: IApiEvents[K]) => void
  ): void {
    this.eventEmitter.on(eventName, handler);
  }

  /**
   * Register an event listener for API errors
   * @param eventName - The type of error event to listen for
   * @param handler - The callback function to handle the error
   */
  public off(eventName: ApiEvents): void {
    this.eventEmitter.off(eventName);
  }
}

export default ApiClient;
