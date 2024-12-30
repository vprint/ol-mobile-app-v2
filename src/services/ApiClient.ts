import NotificationService from 'src/services/notifier/Notifier';
import wretch from 'wretch';

/**
 * API Client for handling HTTP requests.
 */
class ApiClient {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  /**
   * Fetch a JSON to the api.
   * @param endpoint - The endpoint to request.
   * @returns The fetched data.
   */
  public async getJSON<ObjectType>(
    endpoint: string
  ): Promise<ObjectType | undefined> {
    const response = wretch(endpoint)
      .get()
      .json<ObjectType>()
      .catch((error) => {
        console.error(`${error.status}: ${error.message}`);
        this.notificationService.pushError(error.status, error.message);
        return undefined;
      });

    return response;
  }
}

export default ApiClient;
