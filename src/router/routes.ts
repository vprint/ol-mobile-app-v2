import DescPanel from 'src/components/MapComponent/DescPanel.vue';
import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('components/MapComponent/MapComponent.vue'),
    children: [
      {
        path: 'site/:siteId',
        name: 'site',
        component: DescPanel,
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
