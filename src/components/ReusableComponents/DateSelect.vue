<script setup lang="ts">
import { UserMessage } from 'src/enums/user-messages.enum';
import {
  DateValidationOptions,
  DateValidator,
  ValidationResult,
} from 'src/utils/dateValidationUtils';

const props = withDefaults(
  defineProps<{
    label: string;
    editionMode: boolean;
    dateOptions?: DateValidationOptions;
    noPadding?: boolean;
  }>(),
  {
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

function validateDate(val: string | undefined): ValidationResult {
  return dateValidator.validateDate(val);
}

const model = defineModel<string>();
</script>

<template>
  <q-input
    v-model="model"
    :readonly="!editionMode"
    outlined
    color="accent"
    stack-label
    dense
    :class="noPadding ? undefined : 'form-input-element'"
    mask="date"
    :rules="[validateDate]"
    :label="label"
    hide-bottom-space
  >
    <template #append>
      <q-icon v-if="editionMode" name="event" class="cursor-pointer">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-date v-model="model" minimal class="date-picker app-font">
            <div class="row items-center justify-end">
              <q-btn
                v-close-popup
                :label="UserMessage.GENERIC.CLOSE"
                color="primary"
                flat
              />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<style lang="scss" scoped>
.form-input-element {
  margin-bottom: 8px;
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
      background: $low-highlight;
    }
  }
}
</style>
