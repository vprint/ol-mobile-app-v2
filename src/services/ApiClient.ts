import NotificationService from 'src/services/Notifier';
import wretch from 'wretch';

/**
 * API Client for handling HTTP requests.
 */
class ApiClient {
  private baseUrl: string;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  constructor(baseUrl: string = import.meta.env.VITE_API_URL!) {
    this.baseUrl = baseUrl;
  }

  /**
   * Fetch a JSON to the api.
   * @param endpoint - The endpoint to request.
   * @returns The fetched data.
   */
  public async getJSON<T>(endpoint: string): Promise<T | undefined> {
    console.log('appel :', `${this.baseUrl}:${endpoint}`);
    const response = wretch(`${this.baseUrl}:${endpoint}`)
      .get()
      .json<T>()
      .catch((error) => {
        console.error(`${error.status}: ${error.message}`);
        new NotificationService().pushError(error.status, error.message);
        return undefined;
      });

    return response;
  }
}

export default ApiClient;
