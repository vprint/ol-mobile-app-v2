import wretch from 'wretch';
import { WretchError } from 'wretch/resolver';

/**
 * API Client for handling HTTP requests.
 */
class ApiClient {
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
      .badRequest((err) => console.log(err, 'badRequest', err.status))
      .unauthorized((err) => console.log(err, 'unauthorized', err.status))
      .forbidden((err) => console.log(err, 'forbidden', err.status))
      .notFound((err) => console.log(err, 'notFound', err.status))
      .timeout((err) => console.log(err, 'timeout', err.status))
      .internalError((err) => console.log(err, 'internalError', err.status))
      .error(418, (err) => console.log(err, 'error', err.status))
      .fetchError((err) => console.log(err, 'fetchError', err))
      .json<ObjectType>()
      .catch((error) => {
        console.error(error.message);
        return undefined;
      });

    return response;
  }
}

export default ApiClient;
