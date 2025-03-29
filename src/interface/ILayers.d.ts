import { Style } from 'ol/style';
import { StyleFunction } from 'ol/style/Style';
import { LayerIdentifier, LayerProperties } from 'src/enums/layers.enum';

export interface IBaseLayerParameters {
  [LayerProperties.TITLE]: string;
  [LayerProperties.ID]: LayerIdentifier;
  zIndex: number;
  visible: boolean;
  attribution: string[];
  url: string;
  [LayerProperties.ALLOW_PARAMETERS_CHANGE]?: boolean;
}

export interface IBackgroundLayerParameters extends IBaseLayerParameters {
  img: string;
  token?: string;
  vector: boolean;
}

export interface IRasterLayerParameters extends IBaseLayerParameters {
  mode: 'wmts' | 'wms';
  [LayerProperties.DESCRIPTION]: string;
  [LayerProperties.IS_DYNAMIC]: boolean;
}

export interface IVectorTileLayerParameters extends IBaseLayerParameters {
  featureId: string;
  [LayerProperties.ALLOW_EDITION]: boolean;
  [LayerProperties.ALLOW_SELECTION]: boolean;
  style: Style[] | Style | StyleFunction;
}

export type IStyleCache = Record<string, Style>;
