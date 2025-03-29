<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(
  defineProps<{
    label: string;
    editionMode: boolean;
    autogrow?: boolean;
    noPadding?: boolean;
  }>(),
  {
    autogrow: false,
    noPadding: false,
  }
);

const model = defineModel<string>();
</script>

<template>
  <q-input
    v-model="model"
    :readonly="!editionMode"
    :autogrow="autogrow"
    outlined
    color="accent"
    stack-label
    dense
    :class="noPadding ? undefined : 'form-input-element'"
    :label="label"
    hide-bottom-space
  />
</template>

<style lang="scss" scoped>
.form-input-element {
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
