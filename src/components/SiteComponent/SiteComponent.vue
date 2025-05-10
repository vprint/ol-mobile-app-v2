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
import ValidationPopup from '../PopupComponent/ValidationPopup.vue';

// Others imports
import { TransactionMode } from 'src/enums/map.enum';
import { SiteAttributes } from 'src/enums/site-type.enums';

// Type & interface

// script
interface SiteComponentProps {
  siteId?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<SiteComponentProps>();
const siteStore = useSiteStore();
const { site } = storeToRefs(siteStore);
const editionMode = ref(false);
const isTransacting = ref(false);
const validationPopupVisibility = ref(false);

let originalSite = siteStore.site?.clone();

/**
 * Show/hide the validation popup.
 */
function openValidationPopup(): void {
  validationPopupVisibility.value = true;
}

/**
 * Save modification on the site layer.
 */
async function updateSite(): Promise<void> {
  if (site.value) {
    enableEdition(false);
    isTransacting.value = true;

    await siteStore.wfsTransaction(
      site.value.getWFSFeature(),
      TransactionMode.UPDATE
    );

    isTransacting.value = false;
  }
}

/**
 * Cancel modification
 */
function cancel(): void {
  if (originalSite) {
    siteStore.updateSite(originalSite.clone());
  }
  editionMode.value = false;
}

/**
 * Enable form modification and drawing.
 * @param active - Should the edition mode be enabled ?
 */
function enableEdition(active: boolean): void {
  editionMode.value = active;
  siteStore.enableModification(active);
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
  <transition
    appear
    enter-active-class="animated fadeInLeftBig"
    leave-active-class="animated fadeOutLeftBig"
  >
    <SidePanelComponent v-if="site" @close="siteStore.closeSitePanel()">
      <template #title>
        {{ `${site.attributes[SiteAttributes.ENGLISH_NAME]} - ${site.siteId}` }}
      </template>

      <template #content>
        <SiteForm :site-feature="site" :edition-mode="editionMode"></SiteForm>
      </template>

      <template #floatingFooter>
        <SiteFooter
          v-model:edition-mode="editionMode"
          v-model:is-transacting="isTransacting"
          @submit="openValidationPopup()"
          @cancel="cancel()"
          @edit="enableEdition(true)"
        ></SiteFooter>
      </template>
    </SidePanelComponent>
  </transition>
  <ValidationPopup
    v-model:active="validationPopupVisibility"
    @confirm="updateSite()"
  ></ValidationPopup>
</template>

<style lang="scss"></style>
