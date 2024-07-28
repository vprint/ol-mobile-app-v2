import { TOKEN } from './tokenParams';

export const LAYER_PROPERTIES = 'layerProperties';

export interface IBaseLayer {
  name: string;
  layerId: string;
  zIndex: number;
  visible: boolean;
}

export interface IBackgroundLayer extends IBaseLayer {
  url: string;
  img: string;
  token?: string;
  attribution: string[];
}

export interface IRasterLayer extends IBaseLayer {
  mode: 'wmts' | 'wms';
  description: string;
  editable: boolean;
  dynamic: boolean;
  attribution: string[];
}

export interface IVectorTileLayer extends IBaseLayer {
  featureId: string;
  attribution: string[];
  editable: boolean;
  selectionnable: boolean;
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
    zIndex: 0,
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
    zIndex: 0,
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
    zIndex: 0,
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
    zIndex: 0,
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
    name: 'Sites',
    layerId: 'sites',
    featureId: 'site_id',
    attribution: ['Données cartographiques | <b>EFEO</b>'],
    zIndex: 5,
    visible: true,
    editable: false,
    selectionnable: true,
  },
];

/**
 * List of OGC raster layers
 */
export const RASTER_LAYERS_SETTINGS: IRasterLayer[] = [
  {
    mode: 'wms',
    zIndex: 1,
    layerId: 'DEM',
    name: 'Elevation',
    description:
      "Couche d'élévation obtenue à partir d'une interpolation des données LiDAR",
    attribution: ['Données LiDAR | <b>EFEO</b>'],
    visible: true,
    editable: true,
    dynamic: true,
  },
  {
    mode: 'wms',
    zIndex: 2,
    layerId: 'SVF',
    name: 'Sky-View-Factor',
    description:
      'Le Sky-View-Factor est une méthode de visualisation des données altimétrique appréciée des archéologue. Elle permet de visualiser les zones enclavées dans des teintes sombres et les zones surélevées dans des teintes claires',
    attribution: ['Données LiDAR | <b>EFEO</b>'],
    visible: false,
    editable: true,
    dynamic: false,
  },
  {
    mode: 'wmts',
    zIndex: 3,
    layerId: 'SVF',
    name: 'Sky-View-Factor (démonstration tuilage)',
    description:
      "Cette couche WMTS est tuilée. Elle permet d'observer la rapidité lié aux tuilage et au cache des données",
    attribution: ['Données LiDAR | <b>EFEO</b>'],
    visible: false,
    editable: true,
    dynamic: false,
  },
];

export const MEASURE_LAYER: IBaseLayer = {
  name: 'MEASURE_LAYER',
  layerId: 'layer:measure',
  zIndex: 100,
  visible: true,
};
