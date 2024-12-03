<script setup lang="ts">
const emit = defineEmits(['close']);

const thumbStyle: Partial<CSSStyleDeclaration> = {
  borderRadius: '5px',
};
</script>

<template>
  <div class="side-panel">
    <!-- Header -->
    <div class="row text-white items-center header merriweather shadow-4">
      <div class="header-title">
        <slot name="title"></slot>
      </div>
      <q-btn flat dense round icon="close" @click="emit('close')" />
    </div>

    <!-- Main section -->
    <div class="content shadow-4">
      <q-scroll-area class="fit" :thumb-style="thumbStyle">
        <slot name="content"></slot>
      </q-scroll-area>
    </div>

    <!-- Footer -->
    <div v-if="$slots.fixedFooter" class="fixed-footer shadow-4">
      <slot name="fixedFooter"></slot>
    </div>

    <!-- Floating footer -->
    <div v-if="$slots.floatingFooter" class="floating-footer shadow-4">
      <slot name="floatingFooter"></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$side-panel-height: calc(100% - 50px);
$content-width: 400px;

.side-panel {
  position: absolute;
  left: 0;
  height: $side-panel-height;
  width: 430px;
  margin: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;

  .header {
    width: 100%;
    min-height: 64px;
    background: $gradient;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    padding: 8px 16px;
    font-size: 1.1rem;
    z-index: 2;
  }

  .content {
    width: $content-width;
    height: $side-panel-height;
    background-color: $secondary;
    justify-content: center;
    border-radius: 0px 0px 8px 8px;
  }

  .floating-footer {
    background-color: $secondary;
    width: $content-width;
    margin-top: 8px;
    justify-content: center;
    border-radius: 8px;
  }
}
</style>
