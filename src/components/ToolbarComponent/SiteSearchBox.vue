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

// Others imports

// Script
interface ISearchItems {
  label: string;
  value: number;
}

const { site } = storeToRefs(useSiteStore());
const { setSite, clearSite } = useSiteStore();
const { siteList } = storeToRefs(useReferencesStore());

let searchList: ISearchItems[] = [];
const options: Ref<ISearchItems[]> = ref([]);
const searchbox: Ref<QSelect | null> = ref(null);
const model: Ref<string | null> = computed(() =>
  site.value ? site.value.englishName : null
);

/**
 * Filters entries according to the text entered by the user
 * @param val value entered by user
 * @param update update
 */
function filterFn(val: string, update: (fn: () => void) => void): void {
  update(() => {
    const needle = val.toLowerCase();
    options.value = searchList
      .filter((v) => v.label.toLowerCase().includes(needle))
      .slice(0, 5);
  });
}

/**
 * Fetch and set site after selecting it in the list
 * @param site
 */
function selectSite(site: ISearchItems | undefined): void {
  if (site) {
    nextTick(() => {
      if (searchbox.value) {
        searchbox.value.blur();
      }
    });

    setSite(site.value);
  }
}

onMounted(() => {
  const mappedResult = siteList.value.map((site) => ({
    label: site.site_name,
    value: site.site_id,
  }));

  options.value = [...mappedResult];
  searchList = mappedResult;
});
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
    popup-content-class="text-grey-8"
    class="searchbox-select"
    input-debounce="0"
    outlined
    hide-dropdown-icon
    :options="options"
    clearable
    @filter="filterFn"
    @update:model-value="selectSite"
    @clear="clearSite"
  >
    <template #append>
      <q-icon name="sym_s_search" class="cursor-pointer icon-weight-thin">
      </q-icon>
    </template>
  </q-select>
</template>

<style scoped lang="scss">
.searchbox-select {
  width: 250px;
  padding: 4px;
}
</style>
