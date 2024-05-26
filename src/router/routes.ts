import SiteComponent from '../components/SiteComponent/SiteComponent.vue';
import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'site=:siteId',
        name: 'site',
        component: SiteComponent,
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('components/MapComponent/MapComponent.vue'),
  },
];

export default routes;
