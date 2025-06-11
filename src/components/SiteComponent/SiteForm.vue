<script setup lang="ts">
// Store import
import { useReferencesStore } from 'src/stores/references-store';

// Interface
import { SiteAttributes, SiteTypeRefs } from '../../enums/site-type.enums';

// Model import
import Site from 'src/model/site';

// Component import
import FormInput from '../ReusableComponents/FormInput.vue';
import FormSelect from '../ReusableComponents/FormSelect.vue';
import DateSelect from '../ReusableComponents/DateSelect.vue';
import { onMounted, ref, Ref, watch } from 'vue';
import { IIndividual } from 'src/interface/IIndividual';
import { ISiteType } from 'src/interface/ISiteType';

const referencesStore = useReferencesStore();
const site = defineModel<Site>('siteFeature', { required: true });

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps({
  editionMode: Boolean,
});

const userModification: Ref<IIndividual | undefined> = ref(undefined);
const userCreation: Ref<IIndividual | undefined> = ref(undefined);
const locatedBy: Ref<IIndividual | undefined> = ref(undefined);
const featureType: Ref<ISiteType | undefined> = ref(undefined);

/**
 * Set the forms values.
 */
function setFormValues(): void {
  userModification.value = getIndividual(
    site.value.attributes[SiteAttributes.USER_MODIFICATION]
  );

  userCreation.value = getIndividual(
    site.value.attributes[SiteAttributes.USER_CREATION]
  );

  locatedBy.value = getIndividual(
    site.value.attributes[SiteAttributes.LOCATED_BY]
  );

  featureType.value = getSiteType(
    site.value.attributes[SiteAttributes.FEATURE_TYPE]
  );
}

/**
 * Find an individual by it's id.
 * @param id - The id of the individual.
 */
function getIndividual(id: number | undefined): IIndividual | undefined {
  let individual = referencesStore.individuals.find((i) => {
    return i.individualId === id;
  });
  return individual;
}

/**
 * Find a site by it's id.
 * @param id - The site id.
 */
function getSiteType(id: number | undefined): ISiteType | undefined {
  let siteType = referencesStore.siteTypeList.find((st) => {
    return st.siteTypeId === id;
  });
  return siteType;
}

onMounted(() => {
  setFormValues();
});

watch(
  (): Site => site.value,
  () => {
    setFormValues();
  }
);

watch(
  (): boolean => referencesStore.isReferencesInitialized,
  () => {
    setFormValues();
  },
  { once: true }
);
</script>

<template>
  <q-form class="site-form app-font">
    <fieldset>
      <legend>Names</legend>

      <FormInput
        v-model="site.attributes[SiteAttributes.ALTERNATIVE_NAME]"
        :label="SiteTypeRefs.ALTERNATIVE_NAME"
        :edition-mode="editionMode"
      />

      <FormInput
        v-model="site.attributes[SiteAttributes.FRENCH_NAME]"
        :label="SiteTypeRefs.FRENCH_NAME"
        :edition-mode="editionMode"
      />

      <FormInput
        v-model="site.attributes[SiteAttributes.KHMER_NAME]"
        :label="SiteTypeRefs.KHMER_NAME"
        :edition-mode="editionMode"
      />

      <FormInput
        v-model="site.attributes[SiteAttributes.ALTERNATIVE_KHMER_NAME]"
        :label="SiteTypeRefs.ALTERNATIVE_KHMER_NAME"
        :edition-mode="editionMode"
        no-padding
      />
    </fieldset>

    <fieldset>
      <legend>Informations</legend>

      <FormInput
        v-model="site.attributes[SiteAttributes.DESCRIPTION]"
        :label="SiteTypeRefs.DESCRIPTION"
        :edition-mode="editionMode"
        autogrow
      />

      <FormSelect
        v-model="featureType"
        :label="SiteTypeRefs.FEATURE_TYPE"
        :options="referencesStore.siteTypeList"
        option-title="siteTypeName"
        option-value="siteTypeId"
        :disable="!editionMode"
        @update:model-value="
          (siteType) =>
            (site.attributes[SiteAttributes.FEATURE_TYPE] =
              siteType?.siteTypeId)
        "
      />

      <FormInput
        v-model="site.attributes[SiteAttributes.IK_ID]"
        :label="SiteTypeRefs.IK_ID"
        :edition-mode="editionMode"
      />

      <FormInput
        v-model="site.attributes[SiteAttributes.MH_ID]"
        :label="SiteTypeRefs.MH_ID"
        :edition-mode="editionMode"
      />

      <FormSelect
        v-model="locatedBy"
        :label="SiteTypeRefs.LOCATED_BY"
        :options="referencesStore.individuals"
        option-title="individualName"
        option-value="individualId"
        :disable="!editionMode"
        @update:model-value="
          (individual) =>
            (site.attributes[SiteAttributes.LOCATED_BY] =
              individual?.individualId)
        "
      />
    </fieldset>

    <fieldset>
      <legend>Verification</legend>

      <q-checkbox
        v-model="site.attributes[SiteAttributes.GROUND_VERIFIED]"
        :label="SiteTypeRefs.GROUND_VERIFIED"
        :disable="!editionMode"
      />

      <DateSelect
        v-model="site.attributes[SiteAttributes.GROUND_VERIFIED_DATE]"
        :label="SiteTypeRefs.GROUND_VERIFIED_DATE"
        :edition-mode="editionMode"
        date
        no-padding
      />
    </fieldset>

    <fieldset>
      <legend>Ceramics</legend>

      <q-checkbox
        v-model="site.attributes[SiteAttributes.CERAMICS]"
        :label="SiteTypeRefs.CERAMICS"
        :disable="!editionMode"
      />

      <FormInput
        v-model="site.attributes[SiteAttributes.CERAMICS_COMMENTS]"
        :label="SiteTypeRefs.CERAMICS_COMMENTS"
        :edition-mode="editionMode"
        autogrow
        no-padding
      />
    </fieldset>

    <fieldset>
      <legend>Artefacts</legend>

      <FormInput
        v-model="site.attributes[SiteAttributes.ARTEFACTS_COMMENTS]"
        :label="SiteTypeRefs.ARTEFACT_COMMENTS"
        :edition-mode="editionMode"
        autogrow
        no-padding
      />
    </fieldset>

    <fieldset>
      <legend>Build Materials</legend>

      <FormInput
        v-model="site.attributes[SiteAttributes.BUILD_MATERIAL_COMMENTS]"
        :label="SiteTypeRefs.BUILD_MATERIAL_COMMENTS"
        :edition-mode="editionMode"
        autogrow
        no-padding
      />
    </fieldset>

    <fieldset>
      <legend>State</legend>

      <div class="row">
        <q-checkbox
          v-model="site.attributes[SiteAttributes.LOOTED]"
          class="col"
          :label="SiteTypeRefs.LOOTED"
          :disable="!editionMode"
        />

        <q-checkbox
          v-model="site.attributes[SiteAttributes.CLEARED]"
          class="col"
          :label="SiteTypeRefs.CLEARED"
          :disable="!editionMode"
        />
      </div>

      <div class="row">
        <q-checkbox
          v-model="site.attributes[SiteAttributes.CULTIVATED]"
          class="col"
          :label="SiteTypeRefs.CULTIVATED"
          :disable="!editionMode"
        />

        <q-checkbox
          v-model="site.attributes[SiteAttributes.THREATENED]"
          class="col"
          :label="SiteTypeRefs.THREATENED"
          :disable="!editionMode"
        />
      </div>
    </fieldset>

    <fieldset>
      <legend>Database information</legend>

      <FormInput
        v-model="site.attributes[SiteAttributes.DATABASING_COMMENTS]"
        :label="SiteTypeRefs.DATABASING_COMMENTS"
        :edition-mode="editionMode"
        autogrow
      />

      <DateSelect
        v-model="site.attributes[SiteAttributes.CREATION_DATE]"
        :label="SiteTypeRefs.CREATION_DATE"
        :edition-mode="editionMode"
      />

      <DateSelect
        v-model="site.attributes[SiteAttributes.MODIFICATION_DATE]"
        :label="SiteTypeRefs.MODIFICATION_DATE"
        :edition-mode="editionMode"
      />

      <FormSelect
        v-model="userCreation"
        :label="SiteTypeRefs.USER_CREATION"
        :options="referencesStore.individuals"
        option-title="individualName"
        option-value="individualId"
        :disable="!editionMode"
        @update:model-value="
          (individual) =>
            (site.attributes[SiteAttributes.USER_CREATION] =
              individual?.individualId)
        "
      />

      <FormSelect
        v-model="userModification"
        :label="SiteTypeRefs.USER_MODIFICATION"
        :options="referencesStore.individuals"
        option-title="individualName"
        option-value="individualId"
        :disable="!editionMode"
        @update:model-value="
          (individual) =>
            (site.attributes[SiteAttributes.USER_MODIFICATION] =
              individual?.individualId)
        "
      />
    </fieldset>
  </q-form>
</template>

<style lang="scss" scoped>
fieldset {
  border: 1px solid $primary;
  border-radius: 2px;
  margin-top: 16px;
}

legend {
  font-size: 15px;
  padding: 0 8px;
  color: $primary;
}

.site-form {
  padding: 0px 16px 16px;
}
</style>
