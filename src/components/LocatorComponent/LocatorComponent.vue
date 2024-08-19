<script setup lang="ts">
// Vue/Quasar imports
import { ref } from 'vue';

// Store imports
import { useMapStore } from 'src/stores/map-store';

// Map imports

// Others imports
import Location from 'src/plugins/Location';
import { INTERACTIONS_PARAMS } from 'src/utils/params/interactionsParams';
import { storeToRefs } from 'pinia';

// Script
const { map } = storeToRefs(useMapStore());
const isTrackingEnabled = ref(false);
const location = new Location(INTERACTIONS_PARAMS.location);

map.value.addInteraction(location);

function setTracking(tracking: boolean): void {
  location.enableTracking(tracking);
  isTrackingEnabled.value = tracking;
}
</script>

<template>
  <q-btn
    :flat="$q.platform.is.desktop"
    :fab="$q.platform.is.desktop"
    :round="$q.platform.is.mobile"
    :square="$q.platform.is.desktop"
    :color="$q.platform.is.mobile ? 'secondary' : undefined"
    :icon="isTrackingEnabled ? 'sym_s_location_off' : 'sym_s_location_on'"
    class="icon-weight-thin"
    :text-color="$q.platform.is.mobile ? 'primary' : undefined"
    @click="setTracking(!isTrackingEnabled)"
  >
  </q-btn>
</template>
