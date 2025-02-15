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

// Type & interface
import { SiteTypeRefs, SiteAttributes } from '../../enums/site-type.enums';
import { ISite } from 'src/interface/ISite';

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

function updateStringProperty<Key extends keyof ISite>(
  key: Key,
  value: string | number
): void {
  if (site.value) {
    if (typeof value === 'number') value = value.toString();
    site.value.set(key, value as ISite[Key]);
  }
}

function updateNumberProperty<Key extends keyof ISite>(
  key: Key,
  value: string | number
): void {
  if (site.value) {
    site.value.set(key, value());
  }
}

function updateDateProperty<Key extends keyof ISite>(
  key: SiteAttributes,
  value: ISite[Key]
): void {
  if (site.value) {
    site.value.set(key, value);
  }
}

function getSiteProperty<Key extends keyof ISite>(
  key: Key
): ISite[Key] | undefined {
  return site.value?.get(key);
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
      {{
        `${site.get(SiteAttributes.ENGLISH_NAME)} - ${site.get(
          SiteAttributes.SITE_ID
        )}`
      }}
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
            :model-value="getSiteProperty(SiteAttributes.ALTERNATIVE_NAME)"
            :label="SiteTypeRefs.ALTERNATIVE_NAME"
            :edition-mode="editionMode"
            @update:model-value="
              (value) =>
                updateStringProperty(SiteAttributes.ALTERNATIVE_NAME, value)
            "
          />

          <FormInput
            :model-value="site[SiteAttributes.FRENCH_NAME]"
            :label="SiteTypeRefs.FRENCH_NAME"
            :edition-mode="editionMode"
            @update:model-value="
              (value) => updateStringProperty(SiteAttributes.FRENCH_NAME, value)
            "
          />

          <FormInput
            :model-value="getSiteProperty(SiteAttributes.KHMER_NAME)"
            :label="SiteTypeRefs.KHMER_NAME"
            :edition-mode="editionMode"
            @update:model-value="
              (value) => updateStringProperty(SiteAttributes.KHMER_NAME, value)
            "
          />

          <FormInput
            :model-value="
              getSiteProperty(SiteAttributes.ALTERNATIVE_KHMER_NAME)
            "
            :label="SiteTypeRefs.ALTERNATIVE_KHMER_NAME"
            :edition-mode="editionMode"
            no-padding
            @update:model-value="
              (value) =>
                updateStringProperty(
                  SiteAttributes.ALTERNATIVE_KHMER_NAME,
                  value
                )
            "
          />
        </fieldset>

        <fieldset>
          <legend>Informations</legend>

          <FormInput
            :model-value="getSiteProperty(SiteAttributes.DESCRIPTION)"
            :label="SiteTypeRefs.DESCRIPTION"
            :edition-mode="editionMode"
            autogrow
            @update:model-value="
              (value) => updateStringProperty(SiteAttributes.DESCRIPTION, value)
            "
          />

          <FormSelect
            :model-value="getSiteProperty(SiteAttributes.FEATURE_TYPE)"
            :label="SiteTypeRefs.FEATURE_TYPE"
            :options="res.siteTypeList"
            option-value="siteTypeId"
            option-label="siteTypeName"
            :edition-mode="editionMode"
            @update:model-value="
              (value) =>
                updateStringProperty(SiteAttributes.FEATURE_TYPE, value)
            "
          />

          <FormInput
            :model-value="getSiteProperty(SiteAttributes.IK_ID)"
            :label="SiteTypeRefs.IK_ID"
            :edition-mode="editionMode"
            @update:model-value="
              (value) => updateStringProperty(SiteAttributes.IK_ID, value)
            "
          />

          <FormInput
            :model-value="getSiteProperty(SiteAttributes.MH_ID)"
            :label="SiteTypeRefs.MH_ID"
            :edition-mode="editionMode"
            @update:model-value="
              (value) => updateStringProperty(SiteAttributes.MH_ID, value)
            "
          />

          <FormSelect
            :model-value="getSiteProperty(SiteAttributes.LOCATED_BY)"
            :label="SiteTypeRefs.LOCATED_BY"
            :options="res.individuals"
            option-value="individualId"
            option-label="individualName"
            :edition-mode="editionMode"
            no-padding
            @update:model-value="
              (value) => updateStringProperty(SiteAttributes.LOCATED_BY, value)
            "
          />
        </fieldset>

        <fieldset>
          <legend>Verification</legend>

          <q-checkbox
            :model-value="Boolean(getSiteProperty(SiteAttributes.VERIFIED))"
            :label="SiteTypeRefs.VERIFIED"
            :disable="!editionMode"
            @update:model-value="
              (value) => updateStringProperty(SiteAttributes.VERIFIED, value)
            "
          />

          <FormInput
            :model-value="getSiteProperty(SiteAttributes.VERIFICATION_DATE)"
            :label="SiteTypeRefs.VERIFICATION_DATE"
            :edition-mode="editionMode"
            date
            no-padding
            @update:model-value="
              (value) =>
                updateStringProperty(SiteAttributes.VERIFICATION_DATE, value)
            "
          />
        </fieldset>

        <fieldset>
          <legend>Ceramics</legend>

          <q-checkbox
            :model-value="Boolean(getSiteProperty(SiteAttributes.CERAMICS))"
            :label="SiteTypeRefs.CERAMICS"
            :disable="!editionMode"
            @update:model-value="
              (value) => updateStringProperty(SiteAttributes.CERAMICS, value)
            "
          />

          <FormInput
            :model-value="getSiteProperty(SiteAttributes.CERAMICS_DETAILS)"
            :label="SiteTypeRefs.CERAMICS_DETAILS"
            :edition-mode="editionMode"
            autogrow
            no-padding
            @update:model-value="
              (value) =>
                updateStringProperty(
                  SiteAttributes.CERAMICS_DETAILS,
                  value.toString()
                )
            "
          />
        </fieldset>

        <fieldset>
          <legend>Artefacts</legend>

          <FormInput
            :model-value="getSiteProperty(SiteAttributes.ARTEFACTS_COMMENTS)"
            :label="SiteTypeRefs.ARTEFACT_COMMENTS"
            :edition-mode="editionMode"
            autogrow
            no-padding
            @update:model-value="
              (value) =>
                updateStringProperty(
                  SiteAttributes.ARTEFACTS_COMMENTS,
                  value.toString()
                )
            "
          />
        </fieldset>

        <fieldset>
          <legend>Build Materials</legend>

          <FormInput
            :model-value="
              getSiteProperty(SiteAttributes.BUILD_MATERIAL_COMMENTS)
            "
            :label="SiteTypeRefs.BUILD_MATERIAL_COMMENTS"
            :edition-mode="editionMode"
            autogrow
            no-padding
            @update:model-value="
              (value) =>
                updateStringProperty(
                  SiteAttributes.BUILD_MATERIAL_COMMENTS,
                  value
                )
            "
          />
        </fieldset>

        <fieldset>
          <legend>State</legend>

          <div class="row">
            <q-checkbox
              :model-value="Boolean(getSiteProperty(SiteAttributes.LOOTED))"
              class="col"
              :label="SiteTypeRefs.LOOTED"
              :disable="!editionMode"
              @update:model-value="
                (value) => updateStringProperty(SiteAttributes.LOOTED, value)
              "
            />

            <q-checkbox
              :model-value="Boolean(getSiteProperty(SiteAttributes.CLEARED))"
              class="col"
              :label="SiteTypeRefs.CLEARED"
              :disable="!editionMode"
              @update:model-value="
                (value) => updateStringProperty(SiteAttributes.CLEARED, value)
              "
            />
          </div>

          <div class="row">
            <q-checkbox
              :model-value="Boolean(getSiteProperty(SiteAttributes.CULTIVATED))"
              class="col"
              :label="SiteTypeRefs.CULTIVATED"
              :disable="!editionMode"
              @update:model-value="
                (value) =>
                  updateStringProperty(SiteAttributes.CULTIVATED, value)
              "
            />

            <q-checkbox
              :model-value="Boolean(getSiteProperty(SiteAttributes.THREATENED))"
              class="col"
              :label="SiteTypeRefs.THREATENED"
              :disable="!editionMode"
              @update:model-value="
                (value) =>
                  updateStringProperty(SiteAttributes.THREATENED, value)
              "
            />
          </div>
        </fieldset>

        <fieldset>
          <legend>Database information</legend>

          <FormInput
            :model-value="getSiteProperty(SiteAttributes.DATABASING_COMMENTS)"
            :label="SiteTypeRefs.DATABASING_COMMENTS"
            :edition-mode="editionMode"
            autogrow
            @update:model-value="
              (value) =>
                updateStringProperty(
                  SiteAttributes.DATABASING_COMMENTS,
                  value.toString()
                )
            "
          />

          <FormInput
            :model-value="getSiteProperty(SiteAttributes.CREATION_DATE)"
            :label="SiteTypeRefs.CREATION_DATE"
            :edition-mode="editionMode"
            date
            @update:model-value="
              (value) =>
                updateStringProperty(SiteAttributes.CREATION_DATE, value)
            "
          />

          <FormInput
            :model-value="getSiteProperty(SiteAttributes.MODIFICATION_DATE)"
            :label="SiteTypeRefs.MODIFICATION_DATE"
            :edition-mode="editionMode"
            date
            @update:model-value="
              (value) =>
                updateStringProperty(SiteAttributes.MODIFICATION_DATE, value)
            "
          />

          <FormSelect
            :model-value="getSiteProperty(SiteAttributes.USER_CREATION)"
            :label="SiteTypeRefs.USER_CREATION"
            :options="res.individuals"
            option-value="individualId"
            option-label="individualName"
            :edition-mode="editionMode"
            @update:model-value="
              (value) =>
                updateStringProperty(SiteAttributes.USER_CREATION, value)
            "
          />

          <FormSelect
            :model-value="getSiteProperty(SiteAttributes.USER_MODIFICATION)"
            :label="SiteTypeRefs.USER_MODIFICATION"
            :options="res.individuals"
            option-value="individualId"
            option-label="individualName"
            :edition-mode="editionMode"
            no-padding
            @update:model-value="
              (value) =>
                updateStringProperty(SiteAttributes.USER_MODIFICATION, value)
            "
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
