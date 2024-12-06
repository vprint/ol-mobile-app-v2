import { Draw, Interaction } from 'ol/interaction';
import { Map } from 'ol';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { GeometryType } from 'src/enums/geometry.enum';

/**
 * Provides function to manage draw
 * @extends Interaction
 */
class Drawer extends Interaction {
  private drawInteraction: Draw | undefined;
  private drawLayer: VectorLayer | undefined;

  constructor(interactionName: string) {
    super();
    this.set('name', interactionName);
  }

  /**
   * Initialize the component
   * @param map OpenLayers map
   */
  public setMap(map: Map | null): void {
    super.setMap(map);
    if (map) this.addDrawLayer(map);
  }

  private addPolygonFeature(): void {
    const drawSource = this.drawLayer?.getSource();

    this.drawInteraction = new Draw({
      source: drawSource ? drawSource : new VectorSource(),
      type: GeometryType.POLYGON,
    });

    this.getMap()?.addInteraction(this.drawInteraction);
  }

  /**
   * Add the draw layer to the map
   * @param map The OpenLayers map
   */
  private addDrawLayer(map: Map): void {
    const drawLayer = new VectorLayer({
      source: new VectorSource(),
      visible: false,
      zIndex: Infinity,
    });
    map.addLayer(drawLayer);

    this.drawLayer = drawLayer;
  }
}

export default Drawer;
