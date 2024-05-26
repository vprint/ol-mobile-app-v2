<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    label: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: any;
    optionValue?: string | undefined;
    optionLabel?: string | undefined;
    editionMode: boolean;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const model = defineModel<any>();

/**
 * This computed value allows to read properties of sub-objets
 */
const computedModel = computed({
  get: () => {
    // sub-object case (such as locatedBy)
    if (props.optionLabel && !props.multiple) {
      return model.value[props.optionLabel];
    }
    // other case
    else {
      return model.value;
    }
  },

  set: (newValue) => {
    model.value = newValue;
  },
});
</script>

<template>
  <q-select
    v-model="computedModel"
    :options="options"
    :label="label"
    :readonly="!editionMode"
    :hide-dropdown-icon="!editionMode"
    :option-value="optionValue"
    :option-label="optionLabel"
    :multiple="multiple"
    :use-chips="multiple"
    :class="noPadding ? undefined : 'form-select-element'"
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
