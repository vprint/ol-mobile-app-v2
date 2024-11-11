<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    label: string;
    options: unknown;
    editionMode: boolean;
    optionValue?: string;
    optionLabel?: string;
    multiple?: boolean;
    noPadding?: boolean;
  }>(),
  {
    optionValue: undefined,
    optionLabel: undefined,
    multiple: false,
    noPadding: false,
  }
);

const model = defineModel<unknown>();

/**
 * Read properties of objets
 */
const computedModel = computed({
  get: () => {
    if (props.optionLabel && props.optionValue && !props.multiple) {
      // @ts-expect-error Unknown element
      const properties = props.options.find(
        // @ts-expect-error Element is any and ts says props.optionValue can be undefined for unknown reason.
        (element) => element[props.optionValue] === model.value
      );
      return properties?.[props.optionLabel];
    } else {
      return model.value;
    }
  },

  set: (newValue) => {
    if (props.optionValue) {
      model.value = newValue[props.optionValue];
    } else {
      model.value = newValue;
    }
  },
});
</script>

<template>
  <q-select
    v-model="computedModel"
    :options="(options as any)"
    :label="label"
    :readonly="!editionMode"
    :hide-dropdown-icon="!editionMode"
    :option-value="optionValue"
    :option-label="optionLabel"
    :multiple="multiple"
    :use-chips="multiple"
    :class="noPadding ? undefined : 'form-select-element'"
    popup-content-class="merriweather"
    outlined
    square
    dense
    :color="multiple ? 'primary' : 'accent'"
  >
    <template v-if="multiple && optionLabel" #selected-item="scope">
      <q-chip
        square
        dense
        :removable="editionMode"
        :tabindex="scope.tabindex"
        class="q-ma-xs"
        @remove="scope.removeAtIndex(scope.index)"
      >
        {{ scope.opt[optionLabel] }}
      </q-chip>
    </template>
  </q-select>
</template>

<style lang="scss">
.form-select-element {
  margin-bottom: 10px;
}

.q-field {
  &.q-field--readonly {
    &.q-field--outlined {
      .q-field__control {
        &:before {
          border: transparent;
        }
      }
    }
  }
}
</style>
