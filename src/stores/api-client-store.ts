import { IIndividual } from 'src/interface/IIndividual';
import { IProject } from 'src/interface/IProject';
import { ISiteList } from 'src/interface/ISite';
import { ISiteType } from 'src/interface/ISiteType';
import { FeatureCollection } from 'geojson';
import { defineStore } from 'pinia';
import { Reactive } from 'vue';
import { AppVariables } from 'src/enums/app-variables.enum';
import ApiClient from '../services/ApiClient';

export enum cacheEntry {
  SITE = 'site',
  INDIVIDUAL_LIST = 'individualList',
  PROJECT_LIST = 'projectList',
  SITE_LIST = 'siteList',
  SITE_TYPE_LIST = 'siteTypeList',
}

interface ApiRequestorCache {
  site: FeatureCollection | undefined;
  individualList: IIndividual[] | undefined;
  projectList: IProject[] | undefined;
  siteList: ISiteList[] | undefined;
  siteTypeList: ISiteType[] | undefined;
}

export const useApiClientStore = defineStore('apiClient', () => {
  const apiClient = new ApiClient();

  const cache: Reactive<ApiRequestorCache> = {
    site: undefined,
    individualList: undefined,
    projectList: undefined,
    siteList: undefined,
    siteTypeList: undefined,
  };

  /**
   * Clear all the API cache
   */
  function clearCache(): void {
    cache.site = undefined;
    cache.individualList = undefined;
    cache.projectList = undefined;
    cache.siteList = undefined;
    cache.siteTypeList = undefined;
  }

  /**
   * Clear a cache entry
   * @param ref The cache reference to clear
   */
  function clearCacheByReference(ref: cacheEntry): void {
    cache[ref] = undefined;
  }

  /**
   * Returns a site for a give id.
   * @param siteId id of the site
   * @returns A Site object
   */
  async function getSiteById(
    siteId: number
  ): Promise<FeatureCollection | undefined> {
    clearCacheByReference(cacheEntry.SITE);
    cache.site = await apiClient.getJSON<FeatureCollection>(
      `${AppVariables.FUNCTION_SERVER}.get_site_by_id/items.json?id=${siteId}`
    );
    return cache.site;
  }

  /**
   * Get the individuals list
   * @returns individuals List
   */
  async function getIndividualList(): Promise<IIndividual[] | undefined> {
    if (!cache.individualList) {
      cache.individualList = await apiClient.getJSON<IIndividual[]>(
        `${AppVariables.FUNCTION_SERVER}.get_individual_list/items.json?`
      );
    }
    return cache.individualList;
  }

  /**
   * Get the projects list
   * @returns Projects list
   */
  async function getProjectList(): Promise<IProject[] | undefined> {
    if (!cache.projectList) {
      cache.projectList = await apiClient.getJSON<IProject[]>(
        `${AppVariables.FUNCTION_SERVER}.get_project_list/items.json?`
      );
    }
    return cache.projectList;
  }

  /**
   * Get the sites list
   * @param limit - The maximum number of sites to return.
   * @returns Sites list
   */
  async function getSiteList(limit = 1000): Promise<ISiteList[] | undefined> {
    if (!cache.siteList) {
      cache.siteList = await apiClient.getJSON<ISiteList[]>(
        `${AppVariables.FUNCTION_SERVER}.get_site_list/items.json?limit=${limit}`
      );
    }
    return cache.siteList;
  }

  /**
   * Get the site type list
   * @returns Site type list
   */
  async function getSiteTypeList(): Promise<ISiteType[] | undefined> {
    if (!cache.siteTypeList) {
      cache.siteTypeList = await apiClient.getJSON<ISiteType[]>(
        `${AppVariables.FUNCTION_SERVER}.get_sitetypes_list/items.json?`
      );
    }
    return cache.siteTypeList;
  }

  return {
    clearCache,
    clearCacheByReference,
    getSiteById,
    getIndividualList,
    getProjectList,
    getSiteList,
    getSiteTypeList,
  };
});
