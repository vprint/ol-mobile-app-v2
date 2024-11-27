// Vue/Quasar imports
import { onMounted, ref } from 'vue';

// Store imports
import { defineStore } from 'pinia';

// Others imports
import ApiRequestor from 'src/services/ApiRequestor';

// Interface imports
import { ISiteList } from 'src/interface/ISite';
import { IIndividual } from 'src/interface/IIndividual';
import { ISiteType } from 'src/interface/ISiteType';
import { IProject } from 'src/interface/IProject';

/**
 * This store provide application type references.
 */
export const useReferencesStore = defineStore('references', () => {
  let individuals: IIndividual[] = [];
  let siteList: ISiteList[] = [];
  let siteTypeList: ISiteType[] = [];
  let projectList: IProject[] = [];
  // TODO: Implémenter les documents.
  //let documentList: IDocument[] = [];

  const isReferencesInitialized = ref(false);

  /**
   * Initialize values
   */
  onMounted(async () => {
    individuals = (await ApiRequestor.getIndividualList()) ?? [];
    siteList = (await ApiRequestor.getSiteList()) ?? [];
    siteTypeList = (await ApiRequestor.getSiteTypeList()) ?? [];
    projectList = (await ApiRequestor.getProjectList()) ?? [];

    isReferencesInitialized.value = true;
  });

  return {
    individuals,
    siteList,
    siteTypeList,
    projectList,
    isReferencesInitialized,
  };
});
