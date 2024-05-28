<template>
  <!-- Overlay-->
  <q-card id="popup-overlay" class="overlay-box;" style="display: none">
    <!-- Title -->
    <q-card-section class="bg-secondary text-white">
      <slot name="title"></slot>
    </q-card-section>

    <!-- Overlay content -->
    <q-card-section class="overlay-content">
      <slot name="content"></slot>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.overlay-box {
  z-index: 1000;
  border-radius: 0px;
}

.overlay-info {
  background-color: rgba(255, 255, 255, 0.8);
}
</style>
