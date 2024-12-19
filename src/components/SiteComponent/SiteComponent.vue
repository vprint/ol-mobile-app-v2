<script setup lang="ts">
// Map imports

// Vue/Quasar imports
import { ref, watch } from 'vue';

// Store imports
import { storeToRefs } from 'pinia';
import { useSiteStore } from 'src/stores/site-store';
import { useReferencesStore } from 'src/stores/references-store';
import { useDrawStore } from 'src/stores/draw-store';

// Component import
import FormInput from '../ReusableComponents/FormInput.vue';
import FormSelect from '../ReusableComponents/FormSelect.vue';
import SidePanelComponent from '../SidePanelComponent/SidePanelComponent.vue';

// Others imports
import { SiteTypeRefs } from '../../enums/site-type-refs.enums';

// Type & interface

// script
const sis = useSiteStore();
const drs = useDrawStore();
const { site } = storeToRefs(sis);
const res = useReferencesStore();
const editionMode = ref(false);
const confirmDialogVisibility = ref(false);

let originalSite = sis.site?.clone();

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
    sis.updateSite(originalSite.clone());
  }
  editionMode.value = false;
}

/**
 * Enable form modification and drawing.
 * @param active - Should the edition mode be opened ?
 */
function setEditionMode(active: boolean): void {
  editionMode.value = active;
  drs.setVisible(active);
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
  <SidePanelComponent v-if="site" @close="sis.closeSitePanel()">
    <template #title>
      {{ `${site?.englishName} - ${site?.siteId}` }}
    </template>

    <template #content>
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
            :label="SiteTypeRefs.ALTERNATIVE_NAME"
            :edition-mode="editionMode"
          />

          <!-- French name -->
          <FormInput
            v-model="site!.frenchName"
            :label="SiteTypeRefs.FRENCH_NAME"
            :edition-mode="editionMode"
          />

          <!-- Khmer name -->
          <FormInput
            v-model="site!.khmerName"
            :label="SiteTypeRefs.KHMER_NAME"
            :edition-mode="editionMode"
          />

          <!-- alternative khmer name -->
          <FormInput
            v-model="site!.alternativeKhmerName"
            :label="SiteTypeRefs.ALTERNATIVE_KHMER_NAME"
            :edition-mode="editionMode"
            no-padding
          />
        </fieldset>

        <fieldset>
          <legend>Informations</legend>
          <!-- description -->
          <FormInput
            v-model="site!.description"
            :label="SiteTypeRefs.DESCRIPTION"
            :edition-mode="editionMode"
            autogrow
          />

          <!-- Feature type -->
          <FormSelect
            v-model="site!.featureType"
            :label="SiteTypeRefs.FEATURE_TYPE"
            :options="res.siteTypeList"
            option-value="siteTypeId"
            option-label="siteTypeName"
            :edition-mode="editionMode"
          />

          <!-- ikId -->
          <FormInput
            v-model="site!.ikId"
            :label="SiteTypeRefs.IK_ID"
            :edition-mode="editionMode"
          />

          <!-- mhId -->
          <FormInput
            v-model="site!.mhId"
            :label="SiteTypeRefs.MH_ID"
            :edition-mode="editionMode"
          />

          <!-- Located by -->
          <FormSelect
            v-model="site!.locatedBy"
            :label="SiteTypeRefs.LOCATED_BY"
            :options="res.individuals"
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
            :label="SiteTypeRefs.VERIFIED"
            :disable="editionMode ? false : true"
          />

          <!-- Verification date -->
          <FormInput
            v-model="site!.verificationDate"
            :label="SiteTypeRefs.VERIFICATION_DATE"
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
            :label="SiteTypeRefs.CERAMICS"
            :disable="editionMode ? false : true"
          />

          <!-- Ceramic details-->
          <FormInput
            v-model="site!.ceramicsDetails"
            :label="SiteTypeRefs.CERAMICS_DETAILS"
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
            :label="SiteTypeRefs.ARTEFACT_COMMENTS"
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
            :label="SiteTypeRefs.BUILD_MATERIAL_COMMENTS"
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
              :label="SiteTypeRefs.LOOTED"
              :disable="editionMode ? false : true"
            />

            <!-- Cleared -->
            <q-checkbox
              v-model="site!.cleared"
              class="col"
              :label="SiteTypeRefs.CLEARED"
              :disable="editionMode ? false : true"
            />
          </div>

          <div class="row">
            <!-- cultivated -->
            <q-checkbox
              v-model="site!.cultivated"
              class="col"
              :label="SiteTypeRefs.CULTIVATED"
              :disable="editionMode ? false : true"
            />
            <!-- threatened -->
            <q-checkbox
              v-model="site!.threatened"
              class="col"
              :label="SiteTypeRefs.THREATENED"
              :disable="editionMode ? false : true"
            />
          </div>
        </fieldset>

        <fieldset>
          <legend>Database information</legend>
          <!-- databasing comments -->
          <FormInput
            v-model="site!.databasingComments"
            :label="SiteTypeRefs.DATABASING_COMMENTS"
            :edition-mode="editionMode"
            autogrow
          />

          <!-- Creation date -->
          <FormInput
            v-model="site!.creationDate"
            :label="SiteTypeRefs.CREATION_DATE"
            :edition-mode="editionMode"
            date
          />

          <!-- Modificiation date-->
          <FormInput
            v-model="site!.modificationDate"
            :label="SiteTypeRefs.MODIFICATION_DATE"
            :edition-mode="editionMode"
            date
          />

          <!-- user creation -->
          <FormSelect
            v-model="site!.userCreation"
            :label="SiteTypeRefs.USER_CREATION"
            :options="res.individuals"
            option-value="individualId"
            option-label="individualName"
            :edition-mode="editionMode"
          />

          <!-- user modification -->
          <FormSelect
            v-model="site!.userModification"
            :label="SiteTypeRefs.USER_MODIFICATION"
            :options="res.individuals"
            option-value="individualId"
            option-label="individualName"
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
      </q-form>
    </template>
    <template #floatingFooter>
      <div class="site-buttons">
        <q-btn
          v-if="!editionMode"
          rounded
          color="primary"
          label="Edit"
          class="buttons"
          @click="setEditionMode(true)"
        />
        <q-btn
          v-if="editionMode"
          type="reset"
          outline
          rounded
          color="primary"
          label="Cancel"
          class="buttons"
          @click="setEditionMode(false)"
        />
        <q-btn
          v-if="editionMode"
          type="submit"
          rounded
          color="primary"
          label="Save"
          class="buttons"
          @click="setEditionMode(false)"
        />
      </div>
    </template>
  </SidePanelComponent>
</template>

<style lang="scss">
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

.site-buttons {
  margin: 8px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;

  .buttons {
    min-width: 100px;
  }
}

.site-form {
  padding: 0px 16px 16px;
}
</style>
