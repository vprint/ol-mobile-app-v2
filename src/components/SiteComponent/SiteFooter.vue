<!-- eslint-disable vue/valid-define-emits -->

<script setup lang="ts">
import { UserMessage } from 'src/enums/user-messages.enum';

const editionMode = defineModel<boolean>('editionMode');
const isTransacting = defineModel<boolean>('isTransacting');

const emit = defineEmits(['submit', 'cancel', 'edit']);
</script>

<template>
  <div class="site-buttons">
    <q-btn
      v-if="!editionMode"
      rounded
      color="primary"
      :label="UserMessage.GENERIC.EDIT"
      class="buttons app-font"
      :disable="isTransacting"
      @click="emit('edit')"
    />
    <q-btn
      v-if="editionMode"
      outline
      rounded
      color="primary"
      :label="UserMessage.GENERIC.CANCEL"
      class="buttons app-font"
      :disable="isTransacting"
      @click="emit('cancel')"
    />
    <q-btn
      v-if="editionMode"
      rounded
      color="primary"
      :label="UserMessage.GENERIC.SAVE"
      class="buttons app-font"
      :disable="isTransacting"
      @click="emit('submit')"
    />
  </div>
</template>

<style scoped lang="scss">
.site-buttons {
  margin: 8px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;

  .buttons {
    min-width: 100px;
    padding-inline: 20px;
  }
}
</style>
