import { Style } from 'ol/style';
import { StyleFunction } from 'ol/style/Style';
import { LayerIdentifier } from 'src/enums/layers.enum';

export interface IBaseLayer {
  name: string;
  layerId: LayerIdentifier;
  zIndex: number;
  visible: boolean;
}

export interface IBackgroundLayer extends IBaseLayer {
  img: string;
  token?: string;
  attribution: string[];
  url: string;
  vector: boolean;
}

export interface IRasterLayer extends IBaseLayer {
  mode: 'wmts' | 'wms';
  description: string;
  editable: boolean;
  dynamic: boolean;
  attribution: string[];
  url: string;
}

export interface IVectorTileLayer extends IBaseLayer {
  featureId: string;
  attribution: string[];
  editable: boolean;
  selectable: boolean;
  url: string;
  style: Style[] | Style | StyleFunction;
}

export type IStyleCache = Record<string, Style>;
