// Vue/Quasar imports
import { onMounted, Ref, ref } from 'vue';

// Store imports
import { defineStore } from 'pinia';
import { useApiClientStore } from './api-client-store';

// Others imports

// Interface imports
import { ISiteList } from 'src/interface/ISite';
import { IIndividual } from 'src/interface/IIndividual';
import { ISiteType } from 'src/interface/ISiteType';
import { IProject } from 'src/interface/IProject';

const acs = useApiClientStore();

/**
 * This store provide application type references.
 */
export const useReferencesStore = defineStore('references', () => {
  const individuals: Ref<IIndividual[]> = ref([]);
  const siteList: Ref<ISiteList[]> = ref([]);
  const siteTypeList: Ref<ISiteType[]> = ref([]);
  const projectList: Ref<IProject[]> = ref([]);

  const isReferencesInitialized = ref(false);

  /**
   * Initialize values
   */
  onMounted(async () => {
    individuals.value = (await acs.getIndividualList()) ?? [];
    siteList.value = (await acs.getSiteList()) ?? [];
    siteTypeList.value = (await acs.getSiteTypeList()) ?? [];
    projectList.value = (await acs.getProjectList()) ?? [];

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
