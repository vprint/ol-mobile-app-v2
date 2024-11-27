<script setup lang="ts">
const emit = defineEmits(['close']);

const thumbStyle: Partial<CSSStyleDeclaration> = {
  borderRadius: '5px',
};
</script>

<template>
  <q-card class="application-card" square>
    <q-bar
      class="bg-accent text-white row items-center no-wrap header-bar merriweather"
    >
      <div class="row full-width items-center justify-between">
        <div>
          <slot name="title"></slot>
        </div>
        <q-btn
          flat
          dense
          round
          icon="close"
          class="close-button"
          @click="emit('close')"
        />
      </div>
    </q-bar>
    <q-card-section class="scroll-section">
      <q-scroll-area class="fit" :thumb-style="thumbStyle">
        <slot name="component"></slot>
      </q-scroll-area>
    </q-card-section>
    <div v-if="$slots.footer" class="fixed-footer">
      <slot name="footer"></slot>
    </div>
  </q-card>
</template>

<style lang="scss" scoped>
$side-panel-height: calc(100% - 50px);

.application-card {
  position: absolute;
  left: 0;
  width: 400px;
  height: $side-panel-height;
  overflow: auto;
  background-color: $secondary;
  margin: 10px;
  display: flex;
  flex-direction: column;
}

.header-bar {
  position: sticky;
  top: 0px;
  z-index: 1;
  padding: 30px;
}

.close-button-container {
  margin-left: auto;
  padding-right: 0;
}

.close-button {
  margin-right: -15px;
}

.scroll-section {
  height: $side-panel-height;
  padding: 0px;
  margin: 0px;
}

.fixed-footer {
  position: sticky;
  bottom: 0;
  background-color: $secondary;
}
</style>
