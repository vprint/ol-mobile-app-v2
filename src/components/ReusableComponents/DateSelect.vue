<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(
  defineProps<{
    label: string;
    editionMode: boolean;
    noPadding?: boolean;
  }>(),
  {
    noPadding: false,
  }
);

const model = defineModel<string>();
</script>

<template>
  <q-input
    v-model="model"
    :readonly="!editionMode"
    outlined
    square
    color="accent"
    stack-label
    dense
    :class="noPadding ? undefined : 'form-input-element'"
    :label="label"
    type="date"
  >
  </q-input>
</template>

<style lang="scss" scoped>
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
