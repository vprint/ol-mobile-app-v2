<script setup lang="ts">
// Map imports

// Vue/Quasar imports
import { ref, watch } from 'vue';

// Store imports
import { storeToRefs } from 'pinia';
import { useSiteStore } from 'src/stores/site-store';

// Component import
import SidePanelComponent from '../SidePanelComponent/SidePanelComponent.vue';
import SiteForm from './SiteForm.vue';
import SiteFooter from './SiteFooter.vue';
import ValidationPopup from './ValidationPopup.vue';

// Others imports
import { TransactionMode } from 'src/enums/transaction.enum';
import { SiteAttributes } from 'src/enums/site-type.enums';
import { useDrawStore } from 'src/stores/draw-store';

// Type & interface

// script
const sis = useSiteStore();
const drawStore = useDrawStore();
const { site } = storeToRefs(sis);
const editionMode = ref(false);
const confirmDialogVisibility = ref(false);

let originalSite = sis.site?.clone();

/**
 * Show dialog window
 */
function openDialog(): void {
  confirmDialogVisibility.value = true;
}

async function updateSite(): Promise<void> {
  if (site.value) {
    enableEdition(false);
    sis.wfsTransaction(site.value.getWFSFeature(), TransactionMode.UPDATE);
  }
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
function enableEdition(active: boolean): void {
  editionMode.value = active;
  drawStore.setVisible(active);
  modifier.setActive(active);

  if (active) {
    const features = new Collection([siteFeature.value] as Feature[]);
    modifier.addFeaturesToModifier(features);
    mapStore.map.addInteraction(modifier);
  }
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
      {{ `${site.attributes[SiteAttributes.ENGLISH_NAME]} - ${site.siteId}` }}
    </template>

    <template #content>
      <SiteForm :site-feature="site" :edition-mode="editionMode"></SiteForm>
    </template>

    <template #floatingFooter>
      <SiteFooter
        v-model:edition-mode="editionMode"
        v-model:site-feature="site"
        @submit="openDialog()"
        @reset="cancel"
      ></SiteFooter>
    </template>
  </SidePanelComponent>
  <ValidationPopup
    v-model:active="confirmDialogVisibility"
    @confirm="updateSite()"
  ></ValidationPopup>
</template>

<style lang="scss"></style>
