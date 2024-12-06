// Vue/Quasar imports
import { onMounted, Ref, ref } from 'vue';

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
  const individuals: Ref<IIndividual[]> = ref([]);
  const siteList: Ref<ISiteList[]> = ref([]);
  const siteTypeList: Ref<ISiteType[]> = ref([]);
  const projectList: Ref<IProject[]> = ref([]);
  // TODO: Implémenter la recherche de document.
  // const documentList: Ref<IDocument[]> = ref([]);

  const isReferencesInitialized = ref(false);

  /**
   * Initialize values
   */
  onMounted(async () => {
    individuals.value = (await ApiRequestor.getIndividualList()) ?? [];
    siteList.value = (await ApiRequestor.getSiteList()) ?? [];
    siteTypeList.value = (await ApiRequestor.getSiteTypeList()) ?? [];
    projectList.value = (await ApiRequestor.getProjectList()) ?? [];

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
