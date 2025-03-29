import { ApiEvents } from 'src/enums/error-event.enum';
import EventEmitter, { Emitter } from './EventEmitter';
import wretch, { WretchError } from 'wretch';

type IApiEvents = {
  [K in ApiEvents]: WretchError;
};

/**
 * API Client for handling HTTP requests.
 */
class ApiClient {
  private eventEmitter: Emitter<IApiEvents>;

  constructor() {
    this.eventEmitter = EventEmitter<IApiEvents>();
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

  public async postData<ObjectType>(
    url: string,
    data: string
  ): Promise<ObjectType | undefined> {
    const response = wretch(url)
      .post(data)
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
      .text<ObjectType>()
      .catch((error) => {
        console.error(error.message);
        return undefined;
      });

    return response;
  }

  /**
   * Create an event listeners for API errors.
   * @param eventName - The type of error event to listen for.
   * @param handler - The callback function to handle the error.
   */
  public on<K extends ApiEvents>(
    eventName: K,
    handler: (error: IApiEvents[K]) => void
  ): void {
    this.eventEmitter.on(eventName, handler);
  }

  /**
   * Remove an API error event listener.
   *  @param eventName - The name of the event.
   */
  public off(eventName: ApiEvents): void {
    this.eventEmitter.off(eventName);
  }
}

export default ApiClient;
