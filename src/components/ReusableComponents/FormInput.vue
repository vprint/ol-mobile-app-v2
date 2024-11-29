<script setup lang="ts">
import {
  DateValidationOptions,
  DateValidator,
  ValidationResult,
} from 'src/utils/dateValidationUtils';

const props = withDefaults(
  defineProps<{
    label: string;
    editionMode: boolean;
    date?: boolean;
    dateOptions?: DateValidationOptions;
    autogrow?: boolean;
    noPadding?: boolean;
  }>(),
  {
    date: false,
    autogrow: false,
    noPadding: false,
    dateOptions: () => ({
      minDate: new Date(1900, 0, 0),
      maxDate: new Date(2099, 0, 0),
      allowFutureDates: false,
    }),
  }
);

const dateValidator = new DateValidator({
  maxDate: props.dateOptions.maxDate,
  minDate: props.dateOptions.minDate,
  allowFutureDates: props.dateOptions.allowFutureDates,
});

/**
 * Validate the date using dateValidatorUtil
 * @param val The input date in string format or undefined.
 */
function validateDate(val: string | undefined): ValidationResult {
  return dateValidator.validateDate(val);
}

const model = defineModel<string | number>();
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
    :mask="date ? 'date' : undefined"
    :rules="date ? [validateDate] : undefined"
    :label="label"
    hide-bottom-space
  >
    <template #append>
      <q-icon v-if="editionMode && date" name="event" class="cursor-pointer">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-date v-model="model" minimal class="date-picker merriweather">
            <div class="row items-center justify-end">
              <q-btn v-close-popup label="Close" color="primary" flat />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<style lang="scss" scoped>
.form-input-element {
  margin-bottom: 10px;
}

.date-picker {
  border: 1px solid black;
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
