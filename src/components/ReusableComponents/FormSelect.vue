<script setup lang="ts" generic="T extends object">
import { computed } from 'vue';

interface FormSelectProps<T extends object> {
  label: string;
  options: T[];
  editionMode: boolean;
  optionValue?: keyof T;
  optionLabel?: keyof T;
  multiple?: boolean;
  noPadding?: boolean;
}

const props = withDefaults(defineProps<FormSelectProps<T>>(), {
  optionValue: undefined,
  optionLabel: undefined,
  multiple: false,
  noPadding: false,
});

const model = defineModel<T | T[]>();

/**
 * Read properties of objets
 */
const computedModel = computed({
  get: () => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (props.optionLabel && props.optionValue && !props.multiple) {
      return props.options.find((element: T) => {
        const key = props.optionValue as keyof T;
        return element[key] === model.value;
      });
    } else {
      return model.value;
    }
  },
  set: (newValue: T | T[]) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (props.optionValue && !props.multiple) {
      const key = props.optionValue;
      if (!Array.isArray(newValue)) {
        model.value = newValue[key] as T;
      }
    } else {
      model.value = newValue;
    }
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
    :option-value="optionValue?.toString()"
    :option-label="optionLabel?.toString()"
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
  margin-bottom: 8px;
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
      background: $low-highlight;
    }
  }
}
</style>
