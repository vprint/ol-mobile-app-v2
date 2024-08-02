<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(
  defineProps<{
    label: string;
    editionMode: boolean;
    date?: boolean;
    autogrow?: boolean;
    noPadding?: boolean;
  }>(),
  {
    date: false,
    autogrow: false,
    noPadding: false,
  }
);

const model = defineModel<string | number>();
</script>

<template>
  <q-input
    v-model="model"
    :readonly="!editionMode"
    :autogrow="autogrow"
    outlined
    square
    color="accent"
    stack-label
    dense
    :class="noPadding ? undefined : 'form-input-element'"
    :mask="date ? 'date' : undefined"
    :rules="date ? ['date'] : undefined"
    :label="label"
    hide-bottom-space
  >
    <template #append>
      <q-icon v-if="editionMode && date" name="event" class="cursor-pointer">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-date v-model="model" class="merriweather">
            <div class="row items-center justify-end">
              <q-btn v-close-popup label="Close" color="primary" flat />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<style lang="scss">
.form-input-element {
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
