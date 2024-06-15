// Vue/Quasar imports
import { onMounted, Ref, ref } from 'vue';

// Store imports
import { defineStore } from 'pinia';

// Others imports
import { APP_PARAMS } from 'src/utils/params/appParams';
import ApiRequestor from 'src/services/ApiRequestor';

// Interface imports
import { IArtefact } from 'src/interface/IArtefact';
import { IBuildMaterial } from 'src/interface/IBuildMaterial';
//import { IDocument } from 'src/interface/IDocument';
import { IFeatureType } from 'src/interface/IFeatureType';
import { IResearcher } from 'src/interface/IResearcher';
import { IStudyArea } from 'src/interface/IStudyArea';
import { Artefact } from 'src/model/artefact';
//import { AssociatedDocument } from 'src/model/associatedDocument';
import { BuildMaterial } from 'src/model/buildMaterial';
import { Researcher } from 'src/model/researcher';
import { ISiteList } from 'src/interface/ISite';
import { AssociatedDocument } from 'src/model/associatedDocument';
import { IDocument } from 'src/interface/IDocument';

/**
 * Store application type references
 */
export const useReferencesStore = defineStore('references', () => {
  const researchers: Ref<Researcher[]> = ref([]);
  const buildMaterials: Ref<BuildMaterial[]> = ref([]);
  const artefacts: Ref<Artefact[]> = ref([]);
  const featureTypeList: Ref<string[]> = ref([]);
  const studyArea: Ref<string[]> = ref([]);
  const siteList: Ref<ISiteList[]> = ref([]);
  const documentList: Ref<IDocument[]> = ref([]);

  const isReferencesInitialized = ref(false);

  /**
   * Get list of researchers
   * @returns
   */
  async function getResearcherList(): Promise<Researcher[]> {
    const result = await ApiRequestor.getJSON<IResearcher[]>(
      `${APP_PARAMS.featureServer}/functions/public.get_researcher_list/items.json`
    );

    if (result) {
      return result.map((researcher) => new Researcher(researcher));
    }

    return [];
  }

  /**
   * Get list of material builds
   * @returns
   */
  async function getBuildMaterialList(): Promise<BuildMaterial[]> {
    const result = await ApiRequestor.getJSON<IBuildMaterial[]>(
      `${APP_PARAMS.featureServer}/functions/public.get_build_material_list/items.json`
    );

    if (result) {
      return result.map((buildMaterial) => new BuildMaterial(buildMaterial));
    }

    return [];
  }

  /**
   * Get document list
   */
  async function getDocumentList(): Promise<AssociatedDocument[]> {
    const result = await ApiRequestor.getJSON<IDocument[]>(
      `${APP_PARAMS.featureServer}/functions/public.get_document_list/items.json`
    );

    if (result) {
      return result.map((document) => new AssociatedDocument(document));
    }

    return [];
  }

  /**
   * Get artefact list
   */
  async function getArtefactList(): Promise<Artefact[]> {
    const result = await ApiRequestor.getJSON<IArtefact[]>(
      `${APP_PARAMS.featureServer}/functions/public.get_artefact_list/items.json`
    );

    if (result) {
      return result.map((artefact) => new Artefact(artefact));
    }

    return [];
  }

  /**
   * Get feature type list
   */
  async function getFeatureTypeList(): Promise<string[]> {
    const result = await ApiRequestor.getJSON<IFeatureType[]>(
      `${APP_PARAMS.featureServer}/functions/public.get_feature_type_list/items.json`
    );

    if (result) {
      return result.map((type) => type.featureType);
    }

    return [];
  }

  /**
   * Get study area list
   */
  async function getStudyAreaList(): Promise<string[]> {
    const result = await ApiRequestor.getJSON<IStudyArea[]>(
      `${APP_PARAMS.featureServer}/functions/public.get_study_area_list/items.json`
    );

    if (result) {
      return result.map((area) => area.studyArea);
    }

    return [];
  }

  /**
   * Get simplified list of sites
   * @returns
   */
  async function getSiteList(): Promise<ISiteList[]> {
    const result = await ApiRequestor.getJSON<ISiteList[]>(
      `${APP_PARAMS.featureServer}/functions/public.get_site_list/items.json`
    );

    if (result) {
      return result;
    }

    return [];
  }

  /**
   * Initialize values
   */
  onMounted(async () => {
    researchers.value = await getResearcherList();
    buildMaterials.value = await getBuildMaterialList();
    artefacts.value = await getArtefactList();
    featureTypeList.value = await getFeatureTypeList();
    studyArea.value = await getStudyAreaList();
    siteList.value = await getSiteList();
    documentList.value = await getDocumentList();

    isReferencesInitialized.value = true;
  });

  return {
    researchers,
    buildMaterials,
    artefacts,
    featureTypeList,
    studyArea,
    siteList,
    documentList,
    isReferencesInitialized,
  };
});
