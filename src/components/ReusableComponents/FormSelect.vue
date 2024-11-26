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
      // @ts-expect-error unknown type error
      return props.options.find(
        // @ts-expect-error unknown type error
        (element: unknown) => element[props.optionValue] === model.value
      );
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
    popup-content-class="asm-select-list"
    outlined
    dense
    color="accent"
    :menu-offset="[0, 5]"
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

<style lang="scss" scoped>
.form-select-element {
  margin-bottom: 10px;
}

:deep.q-field {
  &.q-field--readonly {
    &.q-field--outlined {
      .q-field__control {
        &:before {
          border: transparent;
        }
      }
    }
  }

  &.q-field--outlined {
    .q-field__control {
      background: rgba(128, 128, 128, 0.05);
    }
  }
}
</style>
