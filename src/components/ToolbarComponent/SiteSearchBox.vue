<script setup lang="ts">
// Map imports

// Vue/Quasar imports
import { computed, nextTick, onMounted, Ref, ref } from 'vue';

// Store imports
import { storeToRefs } from 'pinia';
import { useSiteStore } from '../../stores/site-store';
import { useReferencesStore } from '../../stores/references-store';

// Component imports
import { QSelect } from 'quasar';
import { SiteAttributes } from 'src/enums/site-type.enums';

// Others imports

// Script
interface ISearchItem {
  label: string;
  value: number;
}

const sis = useSiteStore();
const res = useReferencesStore();
const { site } = storeToRefs(sis);
const options: Ref<ISearchItem[]> = ref([]);
const searchbox: Ref<QSelect | null> = ref(null);
const isFocused = ref(false);

const searchList = computed<ISearchItem[]>(() =>
  res.siteList.map((site) => ({
    label: site.siteName
      ? `${site.siteName} - ${site.siteId}`
      : `${site.siteId}`,
    value: site.siteId,
  }))
);

const model = computed({
  get: () =>
    site.value
      ? {
          label: `${site.value.get(
            SiteAttributes.ENGLISH_NAME
          )} - ${site.value.get(SiteAttributes.SITE_ID)}`,
          value: site.value.get(SiteAttributes.SITE_ID),
        }
      : undefined,
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
    sis.openSitePanel(site.value);
  }
}

/**
 * Initialize values
 */
onMounted(() => {
  options.value = [...searchList.value];
});
</script>

<template>
  <q-select
    ref="searchbox"
    v-model="model"
    :menu-offset="[0, 10]"
    hide-selected
    use-input
    fill-input
    label-color="grey-8"
    color="primary"
    bg-color="white"
    popup-content-class="text-grey-8 test asm-select-list"
    class="searchbox-select merriweather"
    input-debounce="0"
    rounded
    outlined
    hide-dropdown-icon
    :options="options"
    clearable
    @filter="filterFn"
    @update:model-value="selectSite"
    @clear="sis.closeSitePanel()"
    @keyup.enter="selectSite(options[0])"
    @focus="isFocused = true"
    @blur="isFocused = false"
  >
    <template #append>
      <q-icon
        v-show="model === undefined && !isFocused"
        name="sym_s_search"
        class="cursor-pointer"
      >
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
