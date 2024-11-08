<script setup lang="ts">
// Map imports

// Vue/Quasar imports
import { computed, nextTick, onMounted, Ref, ref, watch } from 'vue';

// Store imports
import { storeToRefs } from 'pinia';
import { useSiteStore } from '../../stores/site-store';
import { useReferencesStore } from '../../stores/references-store';

// Component imports
import { QSelect } from 'quasar';
import { useSidePanelStore } from 'src/stores/side-panel-store';
import { SIDE_PANEL_PARAM } from 'src/utils/params/sidePanelParams';

// Others imports

// Script
interface ISearchItem {
  label: string;
  value: number;
}

const sis = useSiteStore();
const sps = useSidePanelStore();
const res = useReferencesStore();
const { site } = storeToRefs(sis);
const options: Ref<ISearchItem[]> = ref([]);
const searchbox: Ref<QSelect | null> = ref(null);

const searchList = computed<ISearchItem[]>(() =>
  res.siteList.map((site) => ({
    label: site.siteName
      ? `${site.siteName} - ${site.siteId}`
      : site.siteId.toString(),
    value: site.siteId,
  }))
);

const model = computed({
  get: () =>
    site.value ? `${site.value.englishName} - ${site.value.siteId}` : '',
  set: () => {
    return;
  },
});

/**
 * Filters entries according to the text entered by the user.
 * @param val value entered by user
 * @param update update
 */
function filterFn(val: string, update: (fn: () => void) => void): void {
  update(() => {
    const needle = val.toLowerCase();
    options.value = searchList.value
      .filter((v) => v.label.toLowerCase().includes(needle))
      .slice(0, 5);
  });
}

/**
 * Fetch and set site after selecting it in the list.
 * @param site
 */
function selectSite(site: ISearchItem | undefined): void {
  if (site) {
    nextTick(() => {
      searchbox.value?.blur();
    });

    sps.setActive(true, {
      location: SIDE_PANEL_PARAM.SITE,
      parameterName: 'siteId',
      parameterValue: site.value.toString(),
    });
  }
}

/**
 * Close the opened site and the side panel.
 */
function closeSite(): void {
  sis.clearSite();
  sps.setActive(false);
}

/**
 * Initialize values
 */
onMounted(() => {
  options.value = [...searchList.value];
});

/**
 * Watch for site change and update the text displayed in the searchbox.
 */
watch(
  () => site.value,
  (newSite) => {
    model.value = newSite ? `${newSite.englishName} - ${newSite.siteId}` : '';
  }
);
</script>

<template>
  <q-select
    ref="searchbox"
    v-model="model"
    hide-selected
    use-input
    fill-input
    label-color="grey-8"
    color="primary"
    bg-color="white"
    popup-content-class="text-grey-8 merriweather"
    class="searchbox-select merriweather"
    input-debounce="0"
    outlined
    square
    hide-dropdown-icon
    :options="options"
    clearable
    @filter="filterFn"
    @update:model-value="selectSite"
    @clear="closeSite"
    @keyup.enter="selectSite(options[0])"
  >
    <template #append>
      <q-icon name="sym_s_search" class="cursor-pointer icon-weight-thin">
      </q-icon>
    </template>
  </q-select>
</template>

<style scoped lang="scss">
.searchbox-select {
  width: 300px;
  padding: 4px;
}
</style>
