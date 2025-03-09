import { Style } from 'ol/style';
import { StyleFunction } from 'ol/style/Style';
import { LayerIdentifier } from 'src/enums/layers.enum';

export interface IBaseLayerParameters {
  title: string;
  layerId: LayerIdentifier;
  zIndex: number;
  visible: boolean;
}

export interface IBackgroundLayerParameters extends IBaseLayerParameters {
  img: string;
  token?: string;
  attribution: string[];
  url: string;
  vector: boolean;
}

export interface IRasterLayerParameters extends IBaseLayerParameters {
  mode: 'wmts' | 'wms';
  description: string;
  editable: boolean;
  dynamic: boolean;
  attribution: string[];
  url: string;
}

export interface IVectorTileLayerParameters extends IBaseLayerParameters {
  featureId: string;
  attribution: string[];
  editable: boolean;
  selectable: boolean;
  url: string;
  style: Style[] | Style | StyleFunction;
}

export type IStyleCache = Record<string, Style>;
