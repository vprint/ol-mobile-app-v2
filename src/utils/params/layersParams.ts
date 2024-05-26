import { TOKEN } from './tokenParams';

export interface ILayer {
  name: string;
  layerId: string;
  attribution: string[];
  zIndex: number;
  visible: boolean;
}

export interface IBackgroundLayer extends ILayer {
  url: string;
  img: string;
  token?: string;
}

export interface IRasterLayer extends ILayer {
  description: string;
  editable: boolean;
  dynamic: boolean;
}

export interface IVectorTileLayer extends ILayer {
  featureId: string;
}

/**
 * List of application background layers
 */
export const BACKGROUND_LAYERS_SETTINGS: IBackgroundLayer[] = [
  {
    name: 'Basic',
    layerId: 'jawg-streets',
    url: 'https://tile.jawg.io/jawg-streets/{z}/{x}/{y}@2x.png?',
    img: 'https://tile.jawg.io/jawg-streets/13/6459/3787@2x.png?',
    attribution: [
      '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank" class="jawg-attrib">&copy; <b>Jawg</b>Maps</a> | <a href="https://www.openstreetmap.org/copyright" title="OpenStreetMap is open data licensed under ODbL" target="_blank" class="osm-attrib">&copy; OSM contributors</a>',
    ],
    token: TOKEN.jawgs,
    zIndex: 1,
    visible: false,
  },
  {
    name: 'Light',
    layerId: 'jawg-light',
    url: 'https://tile.jawg.io/jawg-light/{z}/{x}/{y}@2x.png?',
    img: 'https://tile.jawg.io/jawg-light/13/6459/3787@2x.png?',
    attribution: [
      '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank" class="jawg-attrib">&copy; <b>Jawg</b>Maps</a> | <a href="https://www.openstreetmap.org/copyright" title="OpenStreetMap is open data licensed under ODbL" target="_blank" class="osm-attrib">&copy; OSM contributors</a>',
    ],
    token: TOKEN.jawgs,
    zIndex: 1,
    visible: false,
  },
  {
    name: 'Dark',
    layerId: 'jawg-dark',
    url: 'https://tile.jawg.io/jawg-dark/{z}/{x}/{y}@2x.png?',
    img: 'https://tile.jawg.io/jawg-dark/13/6459/3787@2x.png?',
    attribution: [
      '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank" class="jawg-attrib">&copy; <b>Jawg</b>Maps</a> | <a href="https://www.openstreetmap.org/copyright" title="OpenStreetMap is open data licensed under ODbL" target="_blank" class="osm-attrib">&copy; OSM contributors</a>',
    ],
    token: TOKEN.jawgs,
    zIndex: 1,
    visible: false,
  },
  {
    name: 'OSM',
    layerId: 'osm',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png?',
    img: 'https://tile.openstreetmap.org/13/6459/3787.png?',
    attribution: [
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    ],
    zIndex: 1,
    visible: false,
  },
  {
    name: 'Esri World Imagery',
    layerId: 'esri_world_Imagery',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    img: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/13/6459/3787',
    attribution: [
      'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
    ],
    zIndex: 1,
    visible: true,
  },
];

/**
 * List of application vector tiles layers
 */
export const VECTOR_TILE_LAYERS_SETTINGS: IVectorTileLayer[] = [
  {
    name: 'sites',
    layerId: 'sites',
    featureId: 'site_id',
    attribution: ['Données cartographiques | <b>EFEO</b>'],
    zIndex: 5,
    visible: true,
  },
];
