<script setup lang="ts">
// Vue/Quasar imports

// Store imports
import { useMeasureStore } from 'src/stores/measure-store';

// Map imports

// Others imports
import { GeometryType } from '../../enums/map.enum';
import { UserMessage } from 'src/enums/user-messages.enum';

// Script
const mes = useMeasureStore();

const measureButtonList = [
  {
    icon: 'straighten',
    action: (): void => mes.addMeasure(GeometryType.LINE_STRING),
    tooltip: UserMessage.MEASURE.TOOLTIP.DISTANCE,
  },
  {
    icon: 'square_foot',
    action: (): void => mes.addMeasure(GeometryType.POLYGON),
    tooltip: UserMessage.MEASURE.TOOLTIP.AREA,
  },
  {
    icon: 'delete',
    action: (): void => mes.removeMeasure(),
    tooltip: UserMessage.MEASURE.TOOLTIP.DELETE,
  },
];
</script>

<template>
  <q-btn
    unelevated
    icon="sym_s_straighten"
    :text-color="$q.platform.is.mobile ? 'primary' : undefined"
    class="app-button btn--no-hover"
    @click="mes.abortCurrentMeasure()"
  >
    <q-menu v-model="mes.measureMenu" :offset="[0, 10]" class="menu-measure">
      <q-list>
        <q-item
          v-for="(item, index) in measureButtonList"
          :key="index"
          v-close-popup
          clickable
          class="item no-focus no-border"
          @click="item.action"
        >
          <q-item-section avatar>
            <q-avatar class="avatar" :icon="item.icon">
              <q-tooltip
                anchor="bottom middle"
                self="bottom middle"
                transition-show="scale"
                transition-hide="scale"
                :delay="1000"
                style="border-radius: 0"
              >
                {{ item.tooltip }}
              </q-tooltip>
            </q-avatar>
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<style lang="scss">
.no-focus {
  .q-focus-helper {
    display: none !important;
  }
}

.menu-measure {
  background: $secondary;
  padding: 0px !important;

  .item {
    padding: 0px !important;
    transition: all 0.25s;

    .avatar {
      background-color: rgba($orange, 1);
      color: rgba($secondary, 0.75);
      transition: all 0.25s;

      &:hover {
        background-color: rgba($orange-hover, 1);
        color: rgba($secondary, 1);
      }
    }
  }

  .q-item__section--avatar {
    min-width: 0 !important;
  }

  .q-item__section--side {
    padding: 8px;
  }
}
</style>
