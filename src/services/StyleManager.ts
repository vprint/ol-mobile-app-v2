import { Color } from 'ol/color';
import { ColorLike, PatternDescriptor } from 'ol/colorlike';
import { Coordinate } from 'ol/coordinate';
import { FeatureLike } from 'ol/Feature';
import { LineString, MultiPoint, Point, Polygon } from 'ol/geom';
import { Circle, Fill, Stroke, Style } from 'ol/style';

const WHITE = '255, 255, 255';
const HIGHLIGHT_OPACITY = '0.2';

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
   */
  public getStyle(): Style {
    return new Style({
      fill: new Fill({
        color: this.options.fillColor,
      }),
      stroke: this.getStroke(
        this.options.strokeColor,
        this.options.strokeWidth,
        this.options.lineDash
      ),
    });
  }

  /**
   * Return the edition style for the given user parameters. This style add points to the vertex.
   */
  public getEditionStyle(): Style[] {
    return [
      this.getStyle(),
      new Style({
        image: this.getVertexPointStyle(this.options.strokeColor),
      }),
    ];
  }

  /**
   * Return the selection style for the given user parameters.
   */
  public getSelectionStyle(): Style[] {
    return [
      this.getStyle(),

      // A translucid white stroke to highlight the feature.
      new Style({
        stroke: this.getStroke(
          `rgba(${WHITE}, ${HIGHLIGHT_OPACITY})`,
          this.options.strokeWidth ? this.options.strokeWidth + 4 : undefined
        ),
      }),

      // Point over the vertex
      new Style({
        image: this.getVertexPointStyle(this.options.strokeColor),
        geometry: (feature) => this.getFeatureVertex(feature),
      }),
    ];
  }

  /**
   * Return the selection style for the given user parameters.
   */
  public getHoverStyle(): Style[] {
    return [
      this.getStyle(),

      // A translucid white stroke to highlight the feature.
      new Style({
        stroke: this.getStroke(
          `rgba(${WHITE}, ${HIGHLIGHT_OPACITY})`,
          this.options.strokeWidth ? this.options.strokeWidth + 4 : undefined
        ),
      }),
    ];
  }

  /**
   * Return the vertex of a feature as MultiPoint geometry.
   * @param feature - An OpenLayers feature
   */
  private getFeatureVertex(feature: FeatureLike): MultiPoint | undefined {
    const geom = feature.getGeometry();
    let coordinates: Coordinate[] | undefined;

    if (geom instanceof Polygon) {
      coordinates = geom.getCoordinates()[0];
    }
    if (geom instanceof LineString) {
      coordinates = geom.getCoordinates();
    }
    if (geom instanceof Point) {
      coordinates = [geom.getCoordinates()];
    }

    return coordinates ? new MultiPoint(coordinates) : undefined;
  }

  /**
   * Return a style to be applied to the geometry vertex.
   * @param pointColor - The point color.
   */
  private getVertexPointStyle(pointColor: Color | ColorLike): Circle {
    const strokeStyle = new Stroke({
      color: `rgba(${WHITE}, 1)`,
      width: this.options.strokeWidth ? this.options.strokeWidth : undefined,
    });

    return new Circle({
      radius: 5,
      fill: new Fill({
        color: pointColor,
      }),
      stroke: strokeStyle,
    });
  }

  /**
   * Return an OpenLayers stroke.
   * @param color - The stroke color.
   * @param width - The stroke width.
   * @param dash - The stroke dash.
   */
  private getStroke(
    color: Color | ColorLike,
    width: number | undefined,
    dash?: number[]
  ): Stroke {
    return new Stroke({
      color: color,
      width: width,
      lineCap: 'round',
      lineDash: dash ?? undefined,
    });
  }
}

export default StyleManager;
