import wretch from 'wretch';

/**
 * Json getter
 * @param url Url to request
 * @returns Data
 */
async function getJSON<T>(url: string): Promise<T | undefined> {
  const response = wretch(url)
    .get()
    .json<T>()
    .catch((error) => {
      console.error(`${error.status}: ${error.message}`);
      return undefined;
    });
  return response;
}

const ApiRequestor = {
  getJSON,
};

export default ApiRequestor;
