import { LAYER_PROPERTIES_FIELD } from 'src/enums/layers.enum';
import { ILayerProperties } from 'src/interface/ILayerParameters';
import VectorLayer from 'ol/layer/Vector';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorSource from 'ol/source/Vector';

const modificationLayer = new VectorLayer({
  source: new VectorSource(),
});

class AppVectorTileLayer extends VectorTileLayer {
  /**
   * Get the layer informations.
   * @returns
   */
  public getLayerInformations(): ILayerProperties {
    return this.get(LAYER_PROPERTIES_FIELD) as ILayerProperties;
  }

  /**
   * Get the layer as an OpenLayers layer.
   * @returns The OpenLayers VectorTileLayer instance.
   */
  public getAsLayer(): VectorTileLayer {
    return this as VectorTileLayer;
  }

  /**
   * Return the modification layer instance. This is a singleton.
   * @returns The modification layer.
   */
  public getModificationLayer(): VectorLayer {
    return modificationLayer;
  }
}

export default AppVectorTileLayer;
