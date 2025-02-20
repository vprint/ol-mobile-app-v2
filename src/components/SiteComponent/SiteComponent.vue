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
import DateSelect from '../ReusableComponents/DateSelect.vue';
import SidePanelComponent from '../SidePanelComponent/SidePanelComponent.vue';

// Others imports

// Type & interface
import { SiteTypeRefs } from '../../enums/site-type.enums';

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
 * @param active - Should the edition mode be enabled ?
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
      {{ `${site.attributes.englishName} - ${site.siteId}` }}
    </template>

    <template #content>
      <q-form
        class="site-form merriweather"
        @submit="openDialog"
        @reset="cancel"
      >
        <fieldset>
          <legend>Names</legend>

          <FormInput
            v-model="site.attributes.alternativeName"
            :label="SiteTypeRefs.ALTERNATIVE_NAME"
            :edition-mode="editionMode"
          />

          <FormInput
            v-model="site.attributes.frenchName"
            :label="SiteTypeRefs.FRENCH_NAME"
            :edition-mode="editionMode"
          />

          <FormInput
            v-model="site.attributes.khmerName"
            :label="SiteTypeRefs.KHMER_NAME"
            :edition-mode="editionMode"
          />

          <FormInput
            v-model="site.attributes.alternativeKhmerName"
            :label="SiteTypeRefs.ALTERNATIVE_KHMER_NAME"
            :edition-mode="editionMode"
            no-padding
          />
        </fieldset>

        <fieldset>
          <legend>Informations</legend>

          <FormInput
            v-model="site.attributes.description"
            :label="SiteTypeRefs.DESCRIPTION"
            :edition-mode="editionMode"
            autogrow
          />

          <FormSelect
            v-model="site.attributes.featureType"
            :label="SiteTypeRefs.FEATURE_TYPE"
            :options="res.siteTypeList"
            option-value="siteTypeId"
            option-label="siteTypeName"
            :edition-mode="editionMode"
          />

          <FormInput
            v-model="site.attributes.ikId"
            :label="SiteTypeRefs.IK_ID"
            :edition-mode="editionMode"
          />

          <FormInput
            v-model="site.attributes.mhId"
            :label="SiteTypeRefs.MH_ID"
            :edition-mode="editionMode"
          />

          <FormSelect
            v-model="site.attributes.locatedBy"
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

          <q-checkbox
            v-model="site.attributes.verified"
            :label="SiteTypeRefs.VERIFIED"
            :disable="!editionMode"
          />

          <DateSelect
            v-model="site.attributes.verificationDate"
            :label="SiteTypeRefs.VERIFICATION_DATE"
            :edition-mode="editionMode"
            date
            no-padding
          />
        </fieldset>

        <fieldset>
          <legend>Ceramics</legend>

          <q-checkbox
            v-model="site.attributes.ceramics"
            :label="SiteTypeRefs.CERAMICS"
            :disable="!editionMode"
          />

          <FormInput
            v-model="site.attributes.ceramicsDetails"
            :label="SiteTypeRefs.CERAMICS_DETAILS"
            :edition-mode="editionMode"
            autogrow
            no-padding
          />
        </fieldset>

        <fieldset>
          <legend>Artefacts</legend>

          <FormInput
            v-model="site.attributes.artefactsComments"
            :label="SiteTypeRefs.ARTEFACT_COMMENTS"
            :edition-mode="editionMode"
            autogrow
            no-padding
          />
        </fieldset>

        <fieldset>
          <legend>Build Materials</legend>

          <FormInput
            v-model="site.attributes.buildMaterialComments"
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
              v-model="site.attributes.looted"
              class="col"
              :label="SiteTypeRefs.LOOTED"
              :disable="!editionMode"
            />

            <q-checkbox
              v-model="site.attributes.cleared"
              class="col"
              :label="SiteTypeRefs.CLEARED"
              :disable="!editionMode"
            />
          </div>

          <div class="row">
            <q-checkbox
              v-model="site.attributes.cultivated"
              class="col"
              :label="SiteTypeRefs.CULTIVATED"
              :disable="!editionMode"
            />

            <q-checkbox
              v-model="site.attributes.threatened"
              class="col"
              :label="SiteTypeRefs.THREATENED"
              :disable="!editionMode"
            />
          </div>
        </fieldset>

        <fieldset>
          <legend>Database information</legend>

          <FormInput
            v-model="site.attributes.databasingComments"
            :label="SiteTypeRefs.DATABASING_COMMENTS"
            :edition-mode="editionMode"
            autogrow
          />

          <DateSelect
            v-model="site.attributes.creationDate"
            :label="SiteTypeRefs.CREATION_DATE"
            :edition-mode="editionMode"
          />

          <DateSelect
            v-model="site.attributes.modificationDate"
            :label="SiteTypeRefs.MODIFICATION_DATE"
            :edition-mode="editionMode"
          />

          <FormSelect
            v-model="site.attributes.userCreation"
            :label="SiteTypeRefs.USER_CREATION"
            :options="res.individuals"
            option-value="individualId"
            option-label="individualName"
            :edition-mode="editionMode"
          />

          <FormSelect
            v-model="site.attributes.userModification"
            :label="SiteTypeRefs.USER_MODIFICATION"
            :options="res.individuals"
            option-value="individualId"
            option-label="individualName"
            :edition-mode="editionMode"
            no-padding
          />
        </fieldset>
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
