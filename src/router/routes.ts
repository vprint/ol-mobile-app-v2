import { RouteRecordRaw } from 'vue-router';
import { SIDE_PANEL_PARAM } from 'src/utils/params/sidePanelParams';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'site=:siteId',
        name: SIDE_PANEL_PARAM.SITE,
        component: () =>
          import('../components/SiteComponent/SiteComponent.vue'),
        props: true,
      },
      {
        path: SIDE_PANEL_PARAM.LAYER_LIST,
        name: SIDE_PANEL_PARAM.LAYER_LIST,
        component: () =>
          import('src/components/LayerListComponent/LayerManager.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('layouts/MainLayout.vue'),
  },
];

export default routes;
