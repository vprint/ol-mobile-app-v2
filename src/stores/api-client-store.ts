import { IIndividual } from 'src/interface/IIndividual';
import { IProject } from 'src/interface/IProject';
import { ISiteList } from 'src/interface/ISite';
import { ISiteType } from 'src/interface/ISiteType';
import { FeatureCollection } from 'geojson';
import { defineStore } from 'pinia';
import { Reactive } from 'vue';
import { AppVariables } from 'src/enums/app-variables.enum';
import { useNotificationStore } from './notify-store';
import {
  errorTitles,
  errorMessages,
  ApiEvents,
} from 'src/enums/error-event.enum';
import ApiClient from '../services/ApiClient';

export enum CacheEntry {
  SITE = 'site',
  INDIVIDUAL_LIST = 'individualList',
  PROJECT_LIST = 'projectList',
  SITE_LIST = 'siteList',
  SITE_TYPE_LIST = 'siteTypeList',
}

interface ApiRequestorCache {
  [CacheEntry.SITE]: FeatureCollection | undefined;
  [CacheEntry.INDIVIDUAL_LIST]: IIndividual[] | undefined;
  [CacheEntry.PROJECT_LIST]: IProject[] | undefined;
  [CacheEntry.SITE_LIST]: ISiteList[] | undefined;
  [CacheEntry.SITE_TYPE_LIST]: ISiteType[] | undefined;
}

const ns = useNotificationStore();

export const useApiClientStore = defineStore('apiClient', () => {
  const apiClient = new ApiClient();
  _addEventsListener();

  const _cache: Reactive<ApiRequestorCache> = {
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
    _cache.site = undefined;
    _cache.individualList = undefined;
    _cache.projectList = undefined;
    _cache.siteList = undefined;
    _cache.siteTypeList = undefined;
  }

  /**
   * Clear a cache entry
   * @param ref The cache reference to clear
   */
  function clearCacheByReference(ref: CacheEntry): void {
    _cache[ref] = undefined;
  }

  /**
   * Add error event listener and push a notification on error.
   */
  function _addEventsListener(): void {
    Object.values(ApiEvents).forEach((event) => {
      apiClient.on(event, () =>
        ns.pushError(errorMessages[event], errorTitles[event])
      );
    });
  }

  /**
   * Returns a site for a give id.
   * @param siteId id of the site
   * @returns A Site object
   */
  async function getSiteById(
    siteId: number
  ): Promise<FeatureCollection | undefined> {
    clearCacheByReference(CacheEntry.SITE);
    _cache.site = await apiClient.getJSON<FeatureCollection>(
      `${AppVariables.FUNCTION_SERVER}.get_site_by_id/items.json?id=${siteId}`
    );
    return _cache.site;
  }

  /**
   * Get the individuals list
   * @returns individuals List
   */
  async function getIndividualList(): Promise<IIndividual[] | undefined> {
    if (!_cache.individualList) {
      _cache.individualList = await apiClient.getJSON<IIndividual[]>(
        `${AppVariables.FUNCTION_SERVER}.get_individual_list/items.json?`
      );

      return _cache.individualList;
    }
  }

  /**
   * Get the projects list
   * @returns Projects list
   */
  async function getProjectList(): Promise<IProject[] | undefined> {
    if (!_cache.projectList) {
      _cache.projectList = await apiClient.getJSON<IProject[]>(
        `${AppVariables.FUNCTION_SERVER}.get_project_list/items.json?`
      );
      return _cache.projectList;
    }
  }

  /**
   * Get the sites list
   * @param limit - The maximum number of sites to return.
   * @returns Sites list
   */
  async function getSiteList(limit = 1000): Promise<ISiteList[] | undefined> {
    if (!_cache.siteList) {
      _cache.siteList = await apiClient.getJSON<ISiteList[]>(
        `${AppVariables.FUNCTION_SERVER}.get_site_list/items.json?limit=${limit}`
      );
      return _cache.siteList;
    }
  }

  /**
   * Get the site type list
   * @returns Site type list
   */
  async function getSiteTypeList(): Promise<ISiteType[] | undefined> {
    if (!_cache.siteTypeList) {
      _cache.siteTypeList = await apiClient.getJSON<ISiteType[]>(
        `${AppVariables.FUNCTION_SERVER}.get_sitetypes_list/items.json?`
      );

      return _cache.siteTypeList;
    }
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
