import { IIndividual } from 'src/interface/IIndividual';
import { IProject } from 'src/interface/IProject';
import { ISiteList } from 'src/interface/ISite';
import { ISiteType } from 'src/interface/ISiteType';
import { AppVariables } from 'src/enums/app-variables.enum';
import { FeatureCollection } from 'geojson';
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

/**
 * Returns a site for a give id.
 * @param siteId id of the site
 * @returns A Site object
 */
async function getSiteById(
  siteId: number
): Promise<FeatureCollection | undefined> {
  const result = await getJSON<FeatureCollection>(
    `${AppVariables.FEATURE_SERVER}/functions/${AppVariables.DATABASE_SCHEMA}.get_site_by_id/items.json?id=${siteId}`
  );

  return result;
}

/**
 * Get the individuals list
 * @returns individuals List
 */
async function getIndividualList(): Promise<IIndividual[] | undefined> {
  const result = await getJSON<IIndividual[]>(
    `${AppVariables.FEATURE_SERVER}/functions/${AppVariables.DATABASE_SCHEMA}.get_individual_list/items.json?`
  );
  return result;
}

/**
 * Get the projects list
 * @returns Projects list
 */
async function getProjectList(): Promise<IProject[] | undefined> {
  const result = await getJSON<IProject[]>(
    `${AppVariables.FEATURE_SERVER}/functions/${AppVariables.DATABASE_SCHEMA}.get_project_list/items.json?`
  );
  return result;
}

/**
 * Get the sites list
 * @returns Sites list
 */
async function getSiteList(): Promise<ISiteList[] | undefined> {
  const result = await getJSON<ISiteList[]>(
    `${AppVariables.FEATURE_SERVER}/functions/${AppVariables.DATABASE_SCHEMA}.get_site_list/items.json?limit=10000`
  );
  return result;
}

/**
 * Get the site type list
 * @returns Site type list
 */
async function getSiteTypeList(): Promise<ISiteType[] | undefined> {
  const result = await getJSON<ISiteType[]>(
    `${AppVariables.FEATURE_SERVER}/functions/${AppVariables.DATABASE_SCHEMA}.get_sitetypes_list/items.json?`
  );
  return result;
}

const ApiRequestor = {
  getJSON,
  getSiteById,
  getIndividualList,
  getProjectList,
  getSiteList,
  getSiteTypeList,
};

export default ApiRequestor;
