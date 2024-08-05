<script setup lang="ts">
// vue/pinia import
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

// Store import
import { useSidePanelStore } from 'src/stores/side-panel-store';

// Component import

// Others
import { SIDE_PANEL_PARAM } from 'src/utils/params/sidePanelParams';

// Script
const { panelParameters } = storeToRefs(useSidePanelStore());
const isActive = ref(false);

/**
 * Activate / deactivate layer tree
 * @param mode Should the layer tree be opened or closed ?
 */
function enableLayerList(mode: boolean): void {
  const params = mode
    ? {
        location: SIDE_PANEL_PARAM.LAYER_LIST,
      }
    : undefined;

  useSidePanelStore().setActive(mode, params);
  isActive.value = mode;
}

/**
 * Watch for panel parameters change and set/unset active status.
 */
watch(
  () => panelParameters.value.location,
  () => {
    isActive.value =
      panelParameters.value.location === SIDE_PANEL_PARAM.LAYER_LIST;
  }
);
</script>

<template>
  <q-btn
    :fab="$q.platform.is.desktop"
    :round="$q.platform.is.mobile"
    :square="$q.platform.is.desktop"
    :color="isActive ? 'primary' : 'secondary'"
    :text-color="isActive ? 'secondary' : 'primary'"
    icon="sym_s_stacks"
    class="icon-weight-thin"
    unelevated
    @click="
      enableLayerList(
        !(panelParameters.location === SIDE_PANEL_PARAM.LAYER_LIST)
      )
    "
  />
</template>

<style lang="scss"></style>
