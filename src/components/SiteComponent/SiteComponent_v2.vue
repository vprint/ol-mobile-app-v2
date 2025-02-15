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

    <template #content> </template>

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
