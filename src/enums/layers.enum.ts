import { AppVariables } from './app-variables.enum';
import { Token } from './token.enums';
import {
  IBackgroundLayerParameters,
  IRasterLayerParameters,
  IVectorTileLayerParameters,
} from 'src/interface/ILayers';
import { SiteAttributes } from './site-type.enums';
import { getArchSiteStyleFunction } from './layer-style.enum';

export enum LayerIdentifier {
  JAWG_BASIC = 'jawg-streets',
  JAWG_LIGHT = 'jawg-light',
  JAWG_DARK = 'jawg-dark',
  OSM = 'osm',
  ESRI_SATELLITE = 'esri_world_Imagery',
  SITES = 'archsites',
  ELEVATION = 'dem',
  SVF = 'svf',
  SVF_WMTS = 'svf_wmts',
}
export const LAYER_PROPERTIES_FIELD = 'layerProperties';

/**
 * List of application background layers
 */
export const BACKGROUND_LAYERS_SETTINGS: IBackgroundLayerParameters[] = [
  {
    title: 'Basic',
    layerId: LayerIdentifier.JAWG_BASIC,
    url: 'https://api.jawg.io/styles/jawg-streets.json',
    img: 'https://tile.jawg.io/jawg-streets/13/6459/3787@2x.png?',
    attribution: [
      '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank" class="jawg-attrib">&copy; <b>Jawg</b>Maps</a> | <a href="https://www.openstreetmap.org/copyright" title="OpenStreetMap is open data licensed under ODbL" target="_blank" class="osm-attrib">&copy; OSM contributors</a>',
    ],
    token: Token.JAWGS,
    zIndex: 0,
    visible: false,
    vector: true,
  },
  {
    title: 'Light',
    layerId: LayerIdentifier.JAWG_LIGHT,
    url: 'https://api.jawg.io/styles/jawg-light.json',
    img: 'https://tile.jawg.io/jawg-light/13/6459/3787@2x.png?',
    attribution: [
      '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank" class="jawg-attrib">&copy; <b>Jawg</b>Maps</a> | <a href="https://www.openstreetmap.org/copyright" title="OpenStreetMap is open data licensed under ODbL" target="_blank" class="osm-attrib">&copy; OSM contributors</a>',
    ],
    token: Token.JAWGS,
    zIndex: 0,
    visible: false,
    vector: true,
  },
  {
    title: 'Dark',
    layerId: LayerIdentifier.JAWG_DARK,
    url: 'https://api.jawg.io/styles/jawg-dark.json',
    img: 'https://tile.jawg.io/jawg-dark/13/6459/3787@2x.png?',
    attribution: [
      '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank" class="jawg-attrib">&copy; <b>Jawg</b>Maps</a> | <a href="https://www.openstreetmap.org/copyright" title="OpenStreetMap is open data licensed under ODbL" target="_blank" class="osm-attrib">&copy; OSM contributors</a>',
    ],
    token: Token.JAWGS,
    zIndex: 0,
    visible: false,
    vector: true,
  },
  {
    title: 'OSM',
    layerId: LayerIdentifier.OSM,
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png?',
    img: 'https://tile.openstreetmap.org/13/6459/3787.png?',
    attribution: [
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    ],
    zIndex: 0,
    visible: false,
    vector: false,
  },
  {
    title: 'Satellite',
    layerId: LayerIdentifier.ESRI_SATELLITE,
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    img: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/13/3787/6459.png?',
    attribution: [
      'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
    ],
    zIndex: 1,
    visible: true,
    vector: false,
  },
];

/**
 * List of application vector tiles layers
 */
export const VECTOR_TILE_LAYERS_SETTINGS: IVectorTileLayerParameters[] = [
  {
    title: 'Sites',
    layerId: LayerIdentifier.SITES,
    featureId: SiteAttributes.SITE_ID,
    attribution: ['Données cartographiques | <b>EFEO</b>'],
    zIndex: 5,
    visible: true,
    editable: false,
    selectable: true,
    url: `${AppVariables.VECTOR_TILE_SERVER}/maps/archaeological/{z}/{x}/{y}.pbf`,
    style: getArchSiteStyleFunction(),
  },
];

/**
 * List of OGC raster layers
 */
export const RASTER_LAYERS_SETTINGS: IRasterLayerParameters[] = [
  {
    mode: 'wms',
    zIndex: 1,
    layerId: LayerIdentifier.ELEVATION,
    title: 'Elevation',
    description:
      "Couche d'élévation obtenue à partir d'une interpolation des données LiDAR",
    attribution: ['Données LiDAR | <b>EFEO</b>'],
    visible: true,
    editable: true,
    dynamic: true,
    url: `${AppVariables.QGIS_SERVER}/wms?`,
  },
  {
    mode: 'wms',
    zIndex: 2,
    layerId: LayerIdentifier.SVF,
    title: 'Sky-View-Factor',
    description:
      'Le Sky-View-Factor est une méthode de visualisation des données altimétrique. Elle permet de visualiser les zones enclavées dans des teintes sombres et les zones surélevées dans des teintes claires.',
    attribution: ['Données LiDAR | <b>EFEO</b>'],
    visible: false,
    editable: true,
    dynamic: false,
    url: `${AppVariables.QGIS_SERVER}/wms?`,
  },
  {
    mode: 'wmts',
    zIndex: 3,
    layerId: LayerIdentifier.SVF_WMTS,
    title: 'Sky-View-Factor (démonstration tuilage)',
    description:
      "Cette couche WMTS est tuilée. Elle permet d'observer la rapidité lié aux tuilage et au cache des données",
    attribution: ['Données LiDAR | <b>EFEO</b>'],
    visible: false,
    editable: true,
    dynamic: false,
    url: `${AppVariables.QGIS_SERVER}/wms?`,
  },
];

export enum LayerProperties {
  ID = 'id',
  TITLE = 'title',
  TUNABLE = 'tunable',
  EDITABLE = 'editable',
  SELECTABLE = 'selectable',
  DYNAMIC = 'dynamic',
  DESCRIPTION = 'description',
}
