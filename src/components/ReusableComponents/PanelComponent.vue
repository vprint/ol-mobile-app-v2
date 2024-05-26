<script setup lang="ts"></script>

<template>
  <q-card class="application-card">
    <q-bar class="bg-accent text-white row items-center no-wrap header-bar">
      <slot name="title"></slot>
    </q-bar>
    <q-card-section class="scroll-section">
      <q-scroll-area class="fit">
        <div class="content-section">
          <slot name="component"></slot>
        </div>
      </q-scroll-area>
    </q-card-section>
  </q-card>
</template>

<style lang="scss" scoped>
.application-card {
  position: absolute;
  right: 0;
  width: 400px;
  height: calc(100% - 20px);
  overflow: auto;
  background-color: $secondary;
  margin: 10px;
}

.header-bar {
  position: sticky;
  top: 0px;
  z-index: 1;
  padding: 30px;
}

.scroll-section {
  height: calc(100% - 60px);
  padding: 0;
}

.content-section {
  padding: 16px;
}
</style>
