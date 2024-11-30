<script setup lang="ts">
const emit = defineEmits(['close']);

const thumbStyle: Partial<CSSStyleDeclaration> = {
  borderRadius: '5px',
};
</script>

<template>
  <div class="side-panel">
    <!-- Header -->
    <div class="header">
      <div class="header-title">
        <slot name="title"></slot>
      </div>
      <q-btn
        flat
        dense
        round
        icon="close"
        class="header-button"
        @click="emit('close')"
      />
    </div>

    <!-- Main section -->
    <div class="content">
      <q-scroll-area class="fit" :thumb-style="thumbStyle">
        <slot name="content"></slot>
      </q-scroll-area>
    </div>
    <!-- Footer -->
    <div v-if="$slots.footer" class="fixed-footer">
      <slot name="fixedFooter"></slot>
    </div>
    <!-- Floating footer -->
    <div v-if="$slots.floatingFooter" class="floating-footer">
      <slot name="floatingFooter"></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.side-panel {
  position: absolute;
  left: 0;
  height: calc(100% - 50px);
  width: 400px;

  .header {
    width: 100%;
    background: linear-gradient(0.25turn, #e66465, #9198e5);
  }

  .header-button {
    background-color: red;
  }

  .content {
    overflow: auto;
    background-color: $secondary;
  }

  .fixed-footer {
    background-color: green;
  }
  .floating-footer {
    background-color: blue;
  }
}
</style>
