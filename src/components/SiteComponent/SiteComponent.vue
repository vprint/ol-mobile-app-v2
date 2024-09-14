<script setup lang="ts">
// Map imports

// Vue/Quasar imports
import { ref, watch } from 'vue';

// Store imports
import { storeToRefs } from 'pinia';
import { useSiteStore } from 'src/stores/site-store';
import { useReferencesStore } from 'src/stores/references-store';

// Component import
import FormInput from '../ReusableComponents/FormInput.vue';
import FormSelect from '../ReusableComponents/FormSelect.vue';
import SidePanelComponent from '../SidePanelComponent/SidePanelComponent.vue';

// Others imports
import { SITE_TYPE_REFS_PARAMS } from '../../utils/params/siteTypeRefsParams';

// Type & interface

// script
const { site } = storeToRefs(useSiteStore());
const { individuals, siteTypeList } = storeToRefs(useReferencesStore());
const editionMode = ref(false);
const confirmDialogVisibility = ref(false);

let originalSite = site.value?.clone();

const { updateSite } = useSiteStore();

/**
 * Manage dialog event
 * @param visibility Set the dialog visibility
 * @param edition Set form edition mode
 */
function menageDialog(visibility: boolean, edition: boolean): void {
  editionMode.value = edition;
  confirmDialogVisibility.value = visibility;
}

/**
 * Show dialog window
 */
function openDialog(): void {
  menageDialog(true, true);
}

/**
 * Cancel modification
 */
function cancel(): void {
  if (originalSite) {
    updateSite(originalSite.clone());
  }
  editionMode.value = false;
}

// watch for site change and update component
watch(
  () => site.value,
  (newSite) => {
    editionMode.value = false;
    if (newSite) {
      originalSite = newSite.clone();
    }
  }
);
</script>

<template>
  <SidePanelComponent v-if="site">
    <template #title>
      {{ `${site?.englishName} - ${site?.siteId}` }}
    </template>

    <template #component>
      <q-form
        class="site-form merriweather"
        @submit="openDialog"
        @reset="cancel"
      >
        <fieldset>
          <legend>Names</legend>

          <!-- Alternative name -->
          <FormInput
            v-model="site!.alternativeName"
            :label="SITE_TYPE_REFS_PARAMS.alternativeName"
            :edition-mode="editionMode"
          />

          <!-- French name -->
          <FormInput
            v-model="site!.frenchName"
            :label="SITE_TYPE_REFS_PARAMS.frenchName"
            :edition-mode="editionMode"
          />

          <!-- Khmer name -->
          <FormInput
            v-model="site!.khmerName"
            :label="SITE_TYPE_REFS_PARAMS.khmerName"
            :edition-mode="editionMode"
          />

          <!-- alternative khmer name -->
          <FormInput
            v-model="site!.alternativeKhmerName"
            :label="SITE_TYPE_REFS_PARAMS.alternativeKhmerName"
            :edition-mode="editionMode"
            no-padding
          />
        </fieldset>

        <fieldset>
          <legend>Informations</legend>
          <!-- description -->
          <FormInput
            v-model="site!.description"
            :label="SITE_TYPE_REFS_PARAMS.description"
            :edition-mode="editionMode"
          />

          <!-- Feature type -->
          <FormSelect
            v-model="site!.featureType"
            :label="SITE_TYPE_REFS_PARAMS.featureType"
            :options="siteTypeList"
            :edition-mode="editionMode"
          />

          <!-- ikId -->
          <FormInput
            v-model="site!.ikId"
            :label="SITE_TYPE_REFS_PARAMS.ikId"
            :edition-mode="editionMode"
          />

          <!-- mhId -->
          <FormInput
            v-model="site!.mhId"
            :label="SITE_TYPE_REFS_PARAMS.mhId"
            :edition-mode="editionMode"
          />

          <!-- Located by -->
          <FormSelect
            v-model="site!.locatedBy"
            :label="SITE_TYPE_REFS_PARAMS.locatedBy"
            :options="individuals"
            option-value="individualId"
            option-label="individualName"
            :edition-mode="editionMode"
            no-padding
          />
        </fieldset>

        <fieldset>
          <legend>Verification</legend>

          <!-- verified -->
          <q-checkbox
            v-model="site!.verified"
            :label="SITE_TYPE_REFS_PARAMS.verified"
            :disable="editionMode ? false : true"
          />

          <!-- Verification date -->
          <FormInput
            v-model="site!.verificationDate"
            :label="SITE_TYPE_REFS_PARAMS.verificationDate"
            :edition-mode="editionMode"
            date
            no-padding
          />
        </fieldset>

        <fieldset>
          <legend>Ceramics</legend>

          <!-- Ceramics -->
          <q-checkbox
            v-model="site!.ceramics"
            :label="SITE_TYPE_REFS_PARAMS.ceramics"
            :disable="editionMode ? false : true"
          />

          <!-- Ceramic details-->
          <FormInput
            v-model="site!.ceramicsDetails"
            :label="SITE_TYPE_REFS_PARAMS.ceramicsDetails"
            :edition-mode="editionMode"
            autogrow
            no-padding
          />
        </fieldset>

        <fieldset>
          <legend>Artefacts</legend>

          <!-- artefact comment -->
          <FormInput
            v-model="site!.artefactsComments"
            :label="SITE_TYPE_REFS_PARAMS.artefactComments"
            :edition-mode="editionMode"
            autogrow
            no-padding
          />
        </fieldset>

        <fieldset>
          <legend>Build Materials</legend>

          <!-- build material details-->
          <FormInput
            v-model="site!.buildMaterialComments"
            :label="SITE_TYPE_REFS_PARAMS.buildMaterialComments"
            :edition-mode="editionMode"
            autogrow
            no-padding
          />
        </fieldset>

        <fieldset>
          <legend>State</legend>

          <div class="row">
            <!-- Looted -->
            <q-checkbox
              v-model="site!.looted"
              class="col"
              :label="SITE_TYPE_REFS_PARAMS.looted"
              :disable="editionMode ? false : true"
            />

            <!-- Cleared -->
            <q-checkbox
              v-model="site!.cleared"
              class="col"
              :label="SITE_TYPE_REFS_PARAMS.cleared"
              :disable="editionMode ? false : true"
            />
          </div>

          <div class="row">
            <!-- cultivated -->
            <q-checkbox
              v-model="site!.cultivated"
              class="col"
              :label="SITE_TYPE_REFS_PARAMS.cultivated"
              :disable="editionMode ? false : true"
            />
            <!-- threatened -->
            <q-checkbox
              v-model="site!.threatened"
              class="col"
              :label="SITE_TYPE_REFS_PARAMS.threatened"
              :disable="editionMode ? false : true"
            />
          </div>
        </fieldset>

        <fieldset>
          <legend>Database information</legend>
          <!-- databasing comments -->
          <FormInput
            v-model="site!.databasingComments"
            :label="SITE_TYPE_REFS_PARAMS.databasingComments"
            :edition-mode="editionMode"
            autogrow
          />

          <!-- Creation date -->
          <FormInput
            v-model="site!.creationDate"
            :label="SITE_TYPE_REFS_PARAMS.creationDate"
            :edition-mode="editionMode"
            date
          />

          <!-- Modificiation date-->
          <FormInput
            v-model="site!.modificationDate"
            :label="SITE_TYPE_REFS_PARAMS.modificationDate"
            :edition-mode="editionMode"
            date
          />

          <!-- user creation -->
          <FormInput
            v-model="site!.userCreation"
            :label="SITE_TYPE_REFS_PARAMS.userCreation"
            :edition-mode="editionMode"
          />

          <!-- user modification -->
          <FormInput
            v-model="site!.userModification"
            :label="SITE_TYPE_REFS_PARAMS.userModification"
            :edition-mode="editionMode"
            no-padding
          />
        </fieldset>

        <!-- <fieldset>
        <legend>Documents</legend>
        <DocumentsComponent
          v-model="site!.documents as AssociatedDocument[]"
        ></DocumentsComponent>
      </fieldset> -->

        <div class="q-pa-md q-gutter-sm row justify-end">
          <q-btn
            v-if="!editionMode"
            class="site-button"
            square
            color="primary"
            label="Edit"
            @click="editionMode = !editionMode"
          />
          <q-btn
            v-if="editionMode"
            type="reset"
            class="site-button"
            outline
            square
            color="primary"
            label="Cancel"
          />
          <q-btn
            v-if="editionMode"
            type="submit"
            class="site-button"
            square
            color="primary"
            label="Save"
          />
        </div>
      </q-form>
    </template>
  </SidePanelComponent>
</template>

<style lang="scss">
fieldset {
  border: 1px solid $primary;
  border-radius: 2px;
  margin-top: 20px;
}

legend {
  font-size: 15px;
  padding: 0 10px;
  color: $primary;
}

.site-form {
  padding: 0px 16px 0px 16px;
}
</style>
