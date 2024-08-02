import LayerList from 'src/components/LayerListComponent/LayerList.vue';
import SiteComponent from '../components/SiteComponent/SiteComponent.vue';
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
        component: SiteComponent,
      },
      {
        path: SIDE_PANEL_PARAM.LAYER_LIST,
        name: SIDE_PANEL_PARAM.LAYER_LIST,
        component: LayerList,
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
