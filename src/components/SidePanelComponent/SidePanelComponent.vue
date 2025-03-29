<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

interface SidePanelComponentProps {
  width?: number;
}

const props = withDefaults(defineProps<SidePanelComponentProps>(), {
  width: 400,
});

const computedWidth = computed(() => `${props.width}px`);
const computedHeight = ref(`${window.innerHeight - 50}px`);

const handleResize = (): void => {
  computedHeight.value = `${window.innerHeight - 50}px`;
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

const emit = defineEmits(['close']);
</script>

<template>
  <div class="side-panel">
    <!-- Main section -->
    <div class="content shadow-4">
      <!-- Header -->
      <div class="row text-white items-center header app-font shadow-4">
        <div class="title-center">
          <slot name="title"></slot>
        </div>
        <q-btn
          flat
          dense
          round
          icon="close"
          class="app-button btn--no-hover"
          @click="emit('close')"
        />
      </div>

      <!-- Content -->
      <div class="content-area">
        <div class="pa-4 scrollable-content">
          <slot name="content"></slot>
        </div>
      </div>
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
.side-panel {
  position: absolute;
  left: 0;
  max-height: v-bind('computedHeight');
  width: v-bind('computedWidth');
  margin: 8px;
  display: flex;
  flex-direction: column;

  .header {
    width: calc(100% - 8px);
    min-height: 64px;
    background: $gradient;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    padding: 8px 16px;
    margin: 4px;
    font-size: 1.1rem;
    z-index: 2;

    .title-center {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .content {
    width: v-bind('computedWidth');
    flex: 1;
    min-height: 0;
    background-color: $secondary;
    border-radius: 8px;
    position: relative;
    display: flex;
    flex-direction: column;
  }

  .content-area {
    flex: 1;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .scrollable-content {
    flex: 1;
    overflow-y: auto;
  }

  .floating-footer {
    background-color: $secondary;
    width: v-bind('computedWidth');
    margin-top: 8px;
    justify-content: center;
    border-radius: 8px;
  }
}
</style>
