import { RouteRecordRaw } from 'vue-router';
import { SidePanelParameters } from 'src/enums/side-panel.enum';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'site/:siteId',
        name: SidePanelParameters.SITE,
        component: () =>
          import('../components/SiteComponent/SiteComponent.vue'),
        props: true,
      },
      {
        path: SidePanelParameters.LAYER_LIST,
        name: SidePanelParameters.LAYER_LIST,
        component: () =>
          import('src/components/LayerManagerComponent/LayerManager.vue'),
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
