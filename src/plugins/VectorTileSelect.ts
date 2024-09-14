import { Interaction } from 'ol/interaction';
import { MapBrowserEvent } from 'ol';
import { FeatureLike } from 'ol/Feature';
import VectorTileLayer from 'ol/layer/VectorTile';
import Event from 'ol/events/Event.js';
import { Fill, Stroke, Style } from 'ol/style';
import { StyleLike } from 'ol/style/Style';
import { FlatStyleLike } from 'ol/style/flat';
import CircleStyle from 'ol/style/Circle';

/**
 * Vector tile select event type definition
 */
export enum VectorTileSelectEventType {
  VECTOR_TILE_SELECT = 'select:vectortile',
}

/**
 * Vector tile selection event
 */
export class VectorTileSelectEvent extends Event {
  public selected: FeatureLike[] | undefined;
  public mapBrowserEvent: MapBrowserEvent<UIEvent>;

  constructor(
    type: VectorTileSelectEventType,
    selected: FeatureLike[] | undefined,
    mapBrowserEvent: MapBrowserEvent<UIEvent>
  ) {
    super(type);
    this.selected = selected;
    this.mapBrowserEvent = mapBrowserEvent;
  }
}

/**
 * Vector Tile selector class.
 * The class selects features for a given visible vector tile layer on the map.
 */
class VectorTileSelect extends Interaction {
  public selectedFeatures: FeatureLike[] | undefined;

  private selectionStyle = new Style({
    image: new CircleStyle({
      radius: 15,
      fill: new Fill({
        color: '#3399CC',
      }),
      stroke: new Stroke({
        color: '#fff',
        width: 2,
      }),
    }),
  });

  constructor(name: string) {
    super({
      handleEvent: (evt: MapBrowserEvent<UIEvent>): boolean => {
        return this.selectFeaturesAtPixel(evt);
      },
    });
    this.set('name', name);
  }

  /**
   * Select vector features at a given pixel and fires
   * a vector tile select event on selection (select:vectortile).
   * @param e - Map browser event
   * @returns true when the selection is made
   */
  private selectFeaturesAtPixel(e: MapBrowserEvent<UIEvent>): boolean {
    if (e.type === 'click') {
      const features = this.getMap()?.getFeaturesAtPixel(e.pixel, {
        layerFilter: (layer) =>
          layer instanceof VectorTileLayer && layer.getVisible(),
        hitTolerance: 10,
      });

      this.dispatchEvent(
        new VectorTileSelectEvent(
          VectorTileSelectEventType.VECTOR_TILE_SELECT,
          features,
          e
        )
      );

      this.selectedFeatures = features;

      if (features) {
        this.setSelectionStyle(features);
      }
    }
    return true;
  }

  private setSelectionStyle(features: FeatureLike[]): void {
    /**
     * 1 - Récupérer les noms de couches à partir des features
     * 2 - Rechercher les couches à partir des noms obtenus en .1
     *
     * Pour chaque couche :
     * 3 - Extraire le style de couche
     * 4 - Modifier le style extrait pour ajouter le style de selection
     */

    const featuresLayerIdSet = new Set<string>(
      features.map((feature) => feature.get('layer'))
    );

    const mapLayers = this.getMap()
      ?.getAllLayers()
      .forEach((layer) => {
        featuresLayerIdSet.forEach((layerId) => {
          if (
            layer.get('layerProperties').id === layerId &&
            layer instanceof VectorTileLayer
          ) {
            const layerStyle = layer.getStyle();
            layer.setStyle(this.selectionStyle);
          }
        });
      });

    // this.getMap()?.getAllLayers().forEach((layer) => {
    //   if (layer instanceof VectorTileLayer) {
    //     const originalStyle = layer.getStyle();

    //     layer.setStyle((vectorTileFeature: FeatureLike, resolution: number) => {
    //       let style = this.getLayerStyleParams(
    //         originalStyle,
    //         vectorTileFeature,
    //         resolution
    //       );

    //       if (features.includes(vectorTileFeature)) {
    //         // if the style is an array
    //         if (Array.isArray(style)) {
    //           style.push(this.selectionStyle);
    //         }
    //         // if the style is an OL Style
    //         else if (style instanceof Style) {
    //           style = [style, this.selectionStyle];
    //         }
    //         // if the style is a function
    //         else {
    //           style = this.selectionStyle;
    //         }
    //       }
    //       return style;
    //     });
    //   }
    // });
  }

  getLayerStyleParams(
    layerStyle: StyleLike | FlatStyleLike | null | undefined,
    feature: FeatureLike,
    resolution: number
  ): Style | Style[] | undefined {
    let style: Style | Style[] | undefined;
    // is getStyle() a StyleFunction ?
    if (typeof layerStyle === 'function') {
      style = layerStyle(feature, resolution) as Style | Style[];
    }
    // is getStyle() an array of style ?
    else if (Array.isArray(layerStyle)) {
      style = layerStyle as Style[];
    }
    // is getStyle() a Style ?
    else if (layerStyle instanceof Style) {
      style = layerStyle;
    }

    return style;
  }

  public clearSelect(): void {
    this.selectedFeatures = undefined;
    // Remove selection style
  }
}

export default VectorTileSelect;
