<script setup lang="ts"></script>

<template>
  <q-menu square touch-position context-menu class="bg-secondary">
    <q-list dense style="min-width: 100px">
      <q-item v-close-popup clickable>
        <q-item-section>Center</q-item-section>
      </q-item>
      <q-separator />
      <q-item clickable>
        <q-item-section>Measure</q-item-section>
        <q-item-section side>
          <q-icon name="keyboard_arrow_right" />
        </q-item-section>

        <q-menu square anchor="top end" self="top start" class="bg-secondary">
          <q-list>
            <q-item dense clickable>
              <q-item-section>Area</q-item-section>
            </q-item>
            <q-item dense clickable
              ><q-item-section>Distance</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-item>
    </q-list>
  </q-menu>
</template>

<style lang="scss"></style>
