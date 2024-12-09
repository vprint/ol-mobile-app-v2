import { Color } from 'ol/color';
import { ColorLike, PatternDescriptor } from 'ol/colorlike';
import { Coordinate } from 'ol/coordinate';
import { FeatureLike } from 'ol/Feature';
import { Polygon, LineString, MultiPoint } from 'ol/geom';
import { Circle, Fill, Stroke, Style } from 'ol/style';

const WHITE = '255, 255, 255';

export interface IStyleOptions {
  strokeColor: Color | ColorLike;
  fillColor: Color | ColorLike | PatternDescriptor;
  strokeWidth?: number;
  lineDash?: number[];
}

/**
 * Manages the creation of the application styles.
 */
class StyleManager {
  private options: IStyleOptions;

  constructor(options: IStyleOptions) {
    this.options = options;
  }

  /**
   * Return the visualization style for the given user parameters.
   * @param options
   * @returns
   */
  public getStyle(): Style {
    const style = new Style({
      fill: new Fill({
        color: this.options.fillColor,
      }),
      stroke: this.getStroke(
        this.options.strokeColor,
        this.options.strokeWidth,
        this.options.lineDash
      ),
    });

    return style;
  }

  /**
   * Return the edition style for the given user parameters.
   * @param options
   * @returns
   */
  public getEditionStyle(): Style {
    const style = new Style({
      fill: new Fill({
        color: this.options.fillColor,
      }),
      stroke: this.getStroke(
        this.options.strokeColor,
        this.options.strokeWidth,
        this.options.lineDash
      ),
      image: this.getVertexPointStyle(this.options.strokeColor),
    });

    return style;
  }

  /**
   * Return the selection style for the given user parameters.
   * @param options
   * @returns
   */
  public getSelectionStyle(): Style[] {
    const selectedStyle = [
      // The user stroke color
      new Style({
        stroke: this.getStroke(
          this.options.strokeColor,
          this.options.strokeWidth ? this.options.strokeWidth + 1 : undefined,
          this.options.lineDash
        ),
      }),

      // A translucid white stroke to highlight the feature.
      new Style({
        fill: new Fill({
          color: this.options.fillColor,
        }),
        stroke: this.getStroke(
          `rgba(${WHITE}, 0.2)`,
          this.options.strokeWidth ? this.options.strokeWidth + 4 : undefined
        ),
      }),

      // Point over the vertex
      new Style({
        image: this.getVertexPointStyle(this.options.strokeColor),
        geometry: (feature) => this.getFeatureVertex(feature),
      }),
    ];

    return selectedStyle;
  }

  /**
   * Return the vertex of a feature as MultiPoint geometry.
   * This function works for line and polygons.
   * @param feature - An OpenLayers feature
   * @returns
   */
  private getFeatureVertex(feature: FeatureLike): MultiPoint | undefined {
    const geom = feature.getGeometry();
    let coordinates: Coordinate[] | undefined;

    if (geom instanceof Polygon) {
      coordinates = geom.getCoordinates()[0];
    }
    if (geom instanceof LineString) {
      coordinates = geom.getCoordinates();
    } else {
      coordinates = undefined;
    }

    return coordinates ? new MultiPoint(coordinates) : undefined;
  }

  /**
   * Return a style to be applied to the geometry vertex.
   * @param pointColor
   * @returns
   */
  private getVertexPointStyle(pointColor: Color | ColorLike): Circle {
    return new Circle({
      radius: 5,
      stroke: new Stroke({
        color: `rgba(${WHITE}, 1)`,
        width: 2,
      }),
      fill: new Fill({
        color: pointColor,
      }),
    });
  }

  /**
   * Return an OpenLayers stroke.
   * @param strokeColor
   * @param width
   * @param dash
   * @returns
   */
  private getStroke(
    strokeColor: Color | ColorLike,
    width: number | undefined,
    dash?: number[]
  ): Stroke {
    return new Stroke({
      color: strokeColor,
      width: width,
      lineCap: 'round',
      lineDash: dash ?? undefined,
    });
  }
}

export default StyleManager;
