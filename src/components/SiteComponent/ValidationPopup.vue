<script setup lang="ts">
import { UserMessage } from 'src/enums/user-messages.enum';

const active = defineModel<boolean>('active', { required: true });
const emit = defineEmits(['confirm']);

function confirm(): void {
  emit('confirm');
}
</script>

<template>
  <q-dialog v-model="active" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <q-avatar icon="save" color="primary" text-color="white" />
        <span class="q-ml-sm merriweather">{{
          UserMessage.WFS.INSERT.CONFIRM
        }}</span>
      </q-card-section>

      <q-card-actions align="right" class="popup-buttons">
        <q-btn
          v-close-popup
          class="buttons merriweather"
          flat
          :label="UserMessage.GENERIC.CANCEL"
          color="primary"
        />
        <q-space />
        <q-btn
          v-close-popup
          flat
          class="buttons merriweather"
          :label="UserMessage.GENERIC.INSERT"
          color="primary"
          @click="confirm()"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
.popup-buttons {
  margin: 8px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;

  .buttons {
    min-width: 100px;
  }
}
</style>
