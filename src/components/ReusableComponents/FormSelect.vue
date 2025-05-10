<script setup lang="ts" generic="T">
interface IFormSelectInterface<T> {
  label: string;
  options: T[];
  optionTitle: keyof T & string;
  optionValue: keyof T & string;
  disable?: boolean;
  disablePadding?: boolean;
}

const props = withDefaults(defineProps<IFormSelectInterface<T>>(), {
  disable: false,
  disablePadding: false,
});

const model = defineModel<T>();
</script>

<template>
  <q-select
    v-model="model"
    :readonly="props.disable"
    outlined
    color="accent"
    dense
    :options="props.options"
    :option-label="props.optionTitle"
    :option-value="props.optionValue"
    :label="props.label"
    :class="props.disablePadding ? undefined : 'select-padding'"
    popup-content-class="text-grey-8 asm-select-list"
    :hide-dropdown-icon="disable"
    :menu-offset="[0, 5]"
  />
</template>

<style lang="scss">
.select-padding {
  margin-bottom: 8px;
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

  &.q-field--outlined {
    .q-field__control {
      background: $low-highlight;
    }
  }
}
</style>
