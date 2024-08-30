<template>
  <q-card class="application-card" square>
    <q-bar
      class="bg-accent text-white row items-center no-wrap header-bar merriweather"
    >
      <slot name="title"></slot>
    </q-bar>
    <q-card-section class="scroll-section">
      <q-scroll-area class="fit">
        <slot name="component"></slot>
      </q-scroll-area>
    </q-card-section>
    <div v-if="$slots.footer" class="fixed-footer">
      <slot name="footer"></slot>
    </div>
  </q-card>
</template>

<style lang="scss" scoped>
.application-card {
  position: absolute;
  right: 0;
  width: 400px;
  height: calc(100% - 40px);
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

.scroll-section {
  height: calc(100% - 60px);
  padding: 0px;
  margin: 0px;
}

.fixed-footer {
  position: sticky;
  bottom: 0;
  background-color: $secondary;
}
</style>
